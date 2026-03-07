const fs = require("node:fs");
const path = require("node:path");
const yaml = require("yaml");
const { OpenFeature, InMemoryProvider } = require("@openfeature/server-sdk");
const {
	GoFeatureFlagProvider,
	EvaluationType,
} = require("@openfeature/go-feature-flag-provider");

function createLocalProvider() {
	try {
		const flagsPath = path.join(__dirname, "../flags.yaml");
		const fileContent = fs.readFileSync(flagsPath, "utf8");
		const parsedFlags = yaml.parse(fileContent);

		const flagConfig = {};

		// Transform GO Feature Flag YAML structure into OpenFeature InMemoryProvider structure
		for (const [flagName, flagData] of Object.entries(parsedFlags)) {
			if (!flagData || !flagData.variations || !flagData.defaultRule) continue;

			const isEnabled = flagData.defaultRule.variation === "enabled";

			flagConfig[flagName] = {
				disabled: false,
				variants: { enabled: true, disabled: false },
				defaultVariant: isEnabled ? "enabled" : "disabled",
			};
		}

		return new InMemoryProvider(flagConfig);
	} catch (err) {
		console.warn(
			"Could not read or parse flags.yaml, defaulting flags to disabled:",
			err.message,
		);
		const fallbackConfig = {
			"cosmic-summary": {
				defaultVariant: "disabled",
				variants: { disabled: false },
			},
			"cosmic-reply": {
				defaultVariant: "disabled",
				variants: { disabled: false },
			},
		};
		return new InMemoryProvider(fallbackConfig);
	}
}

function createRemoteProvider() {
	// Connect to the sidecar injected by Cloud Run (localhost over HTTP)
	return new GoFeatureFlagProvider({
		endpoint: "http://localhost:1031",
		evaluationType: EvaluationType.Remote,
	});
}

function initOpenFeature() {
	let provider;

	// Cloud Run sets K_SERVICE environment variable in production instances
	const isProduction = !!process.env.K_SERVICE;

	if (isProduction) {
		console.log(
			"Production environment detected. Initializing Remote Sidecar Provider.",
		);
		provider = createRemoteProvider();
	} else {
		provider = createLocalProvider();
	}

	OpenFeature.setProvider(provider);
	return {
		client: OpenFeature.getClient(),
		provider,
	};
}

const { client, provider } = initOpenFeature();

module.exports = {
	featureClient: client,
	featureProvider: provider,
	createLocalProvider,
	createRemoteProvider,
	initOpenFeature,
};
