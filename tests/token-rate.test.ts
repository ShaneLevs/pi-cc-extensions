import assert from "node:assert/strict";
import test from "node:test";
import {
	currentTokenRate,
	formatTokenRate,
	resetTokenRate,
	sampleTokenRate,
} from "../extensions/feature/shell/token-rate.ts";

test("formatTokenRate renders empty for no data, rounds below 1k, and uses k above", () => {
	assert.equal(formatTokenRate(0), "");
	assert.equal(formatTokenRate(-1), "");
	assert.equal(formatTokenRate(Number.NaN), "");
	assert.equal(formatTokenRate(42.4), "42 tok/s");
	assert.equal(formatTokenRate(99.6), "100 tok/s");
	assert.equal(formatTokenRate(1234), "1.2k tok/s");
	assert.equal(formatTokenRate(10500), "10.5k tok/s");
});

test("rate samples average tokens over elapsed turn time", () => {
	resetTokenRate(0);
	assert.equal(currentTokenRate(), 0);

	resetTokenRate(1_000);
	sampleTokenRate(100, 11_000); // 100 tokens in 10s
	assert.equal(currentTokenRate(), 10);

	sampleTokenRate(300, 11_000); // 300 tokens in 10s
	assert.equal(currentTokenRate(), 30);
});

test("sampling without an active turn or zero tokens is ignored", () => {
	resetTokenRate(0);
	sampleTokenRate(500, Date.now());
	assert.equal(currentTokenRate(), 0);

	resetTokenRate(1_000);
	sampleTokenRate(0, 6_000);
	assert.equal(currentTokenRate(), 0);
});

test("resetTokenRate(startAt) restarts accumulation from a new turn start", () => {
	resetTokenRate(1_000);
	sampleTokenRate(100, 11_000); // 10 tok/s
	resetTokenRate(20_000);
	// 新回合刚开头没有样本时保持 0，而不是沿用上回合值
	assert.equal(currentTokenRate(), 0);
	sampleTokenRate(50, 20_500); // 50 tokens in 0.5s
	assert.equal(currentTokenRate(), 100);
});
