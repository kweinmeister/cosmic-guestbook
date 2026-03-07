const { createLocalProvider, createRemoteProvider } = require("./features");
const { InMemoryProvider } = require("@openfeature/server-sdk");
const {
	GoFeatureFlagProvider,
} = require("@openfeature/go-feature-flag-provider");

describe("Feature Flag Provider Factory", () => {
	it("createLocalProvider initializes an InMemoryProvider based on flags.yaml", () => {
		const provider = createLocalProvider();

		// We expect the local provider to be an instance of the basic memory provider
		expect(provider).toBeInstanceOf(InMemoryProvider);
	});

	it("createRemoteProvider initializes a GoFeatureFlagProvider for sidecar usage", () => {
		const provider = createRemoteProvider();

		// We expect the remote provider to be an instance of the specific GO Feature Flag HTTP client
		expect(provider).toBeInstanceOf(GoFeatureFlagProvider);
	});
});
