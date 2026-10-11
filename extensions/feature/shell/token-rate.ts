/**
 * 本回合平均输出速率的共享状态：working-message 负责采集，footer 负责显示。
 *
 * 口径：回合开始计时，token 计数与 working-message 完全同源
 * （优先 provider usage.output，否则 chars/4 估算）。
 * 回合进行中实时更新；回合结束定格为本回合平均速率，直到下一回合覆盖。
 */

let turnStartTime = 0;
let lastRate = 0;

/** 新回合开始：重置计时与上回合定格值。 */
export function resetTokenRate(startAt = 0): void {
	turnStartTime = startAt;
	lastRate = 0;
}

/** 每个 message_update 采样一次：token 数 + 该次采样的耗时；0 token 不覆盖定格值。 */
export function sampleTokenRate(tokens: number, now = Date.now()): void {
	if (!turnStartTime || tokens <= 0) return;
	const elapsed = (now - turnStartTime) / 1000;
	if (elapsed <= 0) return;
	lastRate = tokens / elapsed;
}

/** 当前显示值：回合中为实时平均，回合外为上一回合定格值。 */
export function currentTokenRate(): number {
	return lastRate;
}

/** ≥ 1000 显示 1.2k tok/s，否则整数；无数据显示空串。 */
export function formatTokenRate(rate: number): string {
	if (!Number.isFinite(rate) || rate <= 0) return "";
	const value = rate >= 1000 ? `${(rate / 1000).toFixed(1)}k` : `${Math.round(rate)}`;
	return `${value} tok/s`;
}
