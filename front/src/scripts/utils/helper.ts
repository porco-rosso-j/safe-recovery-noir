import { ethers } from "ethers";
export async function parseUint8ArrayToStrArray(
	value: Uint8Array
): Promise<string[]> {
	let array: string[] = [];
	for (let i = 0; i < value.length; i++) {
		array[i] = value[i].toString();
	}
	return array;
}

export async function parseUint8ArrayToBytes32(
	value: Uint8Array
): Promise<string[]> {
	let array: string[] = [];

	console.log("value: ", value);
	for (let i = 0; i < value.length; i++) {
		let element = `0x${value[i].toString(16).padStart(2, "0")}`;
		array[i] = ethers.zeroPadValue(element, 32);
	}
	console.log("array: ", array);
	return array;
}

export function calcTimeDiff(solidityTimestamp: number) {
	let timeDiffInSeconds = solidityTimestamp - Math.floor(Date.now() / 1000);
	if (timeDiffInSeconds < 0) {
		return "*Reload the page, already executable";
	}

	const secondsInAMinute = 60;
	const secondsInAnHour = secondsInAMinute * 60;
	const secondsInADay = secondsInAnHour * 24;

	const days = Math.floor(timeDiffInSeconds / secondsInADay);
	timeDiffInSeconds -= days * secondsInADay;

	const hours = Math.floor(timeDiffInSeconds / secondsInAnHour);
	timeDiffInSeconds -= hours * secondsInAnHour;

	const minutes = Math.floor(timeDiffInSeconds / secondsInAMinute);

	// Construct the result string
	let result = "";

	if (days > 0) {
		result += `${days} days `;
	}
	if (hours > 0 && days === 0) {
		result += `${hours} hours `;
	}
	if (minutes > 0 && days === 0 && hours === 0) {
		result += `${minutes} mins`;
	} else {
		result = "will be ready soon";
	}

	return result;
}

export const typeName = (type: number) => {
	if (type === 1) {
		return "Backup Address";
	} else if (type === 2) {
		return "Fingerprint";
	} else if (type === 3) {
		return "Secret";
	} else if (type === 4) {
		return "Social";
	}
};
