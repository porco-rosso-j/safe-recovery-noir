export async function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export const delay = 10; // 10 sec

export function daysToMilliseconds(days) {
	return days * 24 * 60 * 60 * 1000;
}
