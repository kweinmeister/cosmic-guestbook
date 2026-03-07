import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock the global fetch
window.fetch = vi.fn();

const mockEntries = [
	{
		id: 1,
		name: "Commander Shepard",
		message: "I should go.",
		timestamp: "2024-01-01",
		aiReply: null,
	},
];

const mockEntriesWithReply = [
	{
		id: 1,
		name: "Commander Shepard",
		message: "I should go.",
		timestamp: "2024-01-01",
		aiReply:
			"Welcome aboard Station Zenith, Commander! May your cosmic journey be legendary.",
	},
];

function mockFetchResponses(
	entries,
	summary = { summary: null, enabled: false },
) {
	window.fetch
		.mockResolvedValueOnce({ ok: true, json: async () => entries })
		.mockResolvedValueOnce({ ok: true, json: async () => summary });
}

describe("App component", () => {
	beforeEach(() => {
		window.fetch.mockClear();
	});

	it("renders Cosmic Guestbook header", async () => {
		mockFetchResponses(mockEntries);
		render(<App />);

		const headerElement = screen.getByText(/Cosmic/i);
		expect(headerElement).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText("Commander Shepard")).toBeInTheDocument();
		});
	});

	it("renders empty state when no entries", async () => {
		mockFetchResponses([]);
		render(<App />);

		await waitFor(() => {
			expect(
				screen.getByText(/Awaiting first transmission/i),
			).toBeInTheDocument();
		});
	});

	it("renders AI summary when feature flag is enabled", async () => {
		mockFetchResponses(mockEntries, {
			summary: "A lone commander has left their mark on the cosmos.",
			enabled: true,
		});
		render(<App />);

		await waitFor(() => {
			expect(screen.getByText(/Cosmic Summary/i)).toBeInTheDocument();
			expect(screen.getByText(/lone commander/i)).toBeInTheDocument();
		});
	});

	it("does not render summary card when flag is disabled", async () => {
		mockFetchResponses(mockEntries);
		render(<App />);

		await waitFor(() => {
			expect(screen.getByText("Commander Shepard")).toBeInTheDocument();
		});
		expect(screen.queryByText(/Cosmic Summary/i)).not.toBeInTheDocument();
	});

	it("renders AI auto-reply when entry has aiReply", async () => {
		mockFetchResponses(mockEntriesWithReply);
		render(<App />);

		await waitFor(() => {
			expect(screen.getByText(/Station Zenith AI/i)).toBeInTheDocument();
			expect(
				screen.getByText(/cosmic journey be legendary/i),
			).toBeInTheDocument();
		});
	});

	it("does not render reply bubble when aiReply is null", async () => {
		mockFetchResponses(mockEntries);
		render(<App />);

		await waitFor(() => {
			expect(screen.getByText("Commander Shepard")).toBeInTheDocument();
		});
		expect(screen.queryByText(/Station Zenith AI/i)).not.toBeInTheDocument();
	});

	it("handles fetch error gracefully", async () => {
		window.fetch.mockRejectedValueOnce(new Error("Network error"));
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(<App />);

		await waitFor(() => {
			expect(
				screen.getByText(/Awaiting first transmission/i),
			).toBeInTheDocument();
		});

		expect(consoleSpy).toHaveBeenCalledWith(
			"Failed to fetch entries:",
			expect.any(Error),
		);

		consoleSpy.mockRestore();
	});
});
