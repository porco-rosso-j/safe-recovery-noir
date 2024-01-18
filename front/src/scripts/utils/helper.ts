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
	if (solidityTimestamp < 1000) {
		return "*Reload the page, already executable";
	}
	const diff = solidityTimestamp - Math.floor(Date.now() / 1000);
	let result = convertTimestampIntoTime(diff);

	// const secondsInAMinute = 60;
	// const secondsInAnHour = secondsInAMinute * 60;
	// const secondsInADay = secondsInAnHour * 24;

	// const days = Math.floor(timeDiffInSeconds / secondsInADay);
	// timeDiffInSeconds -= days * secondsInADay;

	// const hours = Math.floor(timeDiffInSeconds / secondsInAnHour);
	// timeDiffInSeconds -= hours * secondsInAnHour;

	// const minutes = Math.floor(timeDiffInSeconds / secondsInAMinute);

	// // Construct the result string
	// let result = "";

	// if (days > 0) {
	// 	result += `${days} days `;
	// }
	// if (hours > 0 && days === 0) {
	// 	result += `${hours} hours `;
	// }
	// if (minutes > 0 && days === 0 && hours === 0) {
	// 	result += `${minutes} mins`;
	// }

	if (result === "") {
		result = "Ready in under a min";
	}

	return result;
}

export function getTimeFromTimestamp(time: number) {
	if (time < 60) {
		return time + "seconds";
	} else {
		return convertTimestampIntoTime(time);
	}
}

export function convertTimestampIntoTime(timestamp: number) {
	const secondsInAMinute = 60;
	const secondsInAnHour = secondsInAMinute * 60;
	const secondsInADay = secondsInAnHour * 24;

	const days = Math.floor(timestamp / secondsInADay);
	timestamp -= days * secondsInADay;

	const hours = Math.floor(timestamp / secondsInAnHour);
	timestamp -= hours * secondsInAnHour;

	const minutes = Math.floor(timestamp / secondsInAMinute);
	timestamp -= minutes * secondsInAMinute;

	let result = "";

	// if (days > 0) {
	// 	result += ` ${days} days `;
	// }

	result += days > 0 ? ` ${days} days +` : "0 days &";
	result += hours > 0 ? ` ${hours} :` : " 00 : ";
	result += minutes > 0 ? ` ${minutes} :` : " 00 : ";
	result += timestamp > 0 ? ` ${timestamp}` : " 00";
	// result += " (s)";

	// if (hours > 0 && days === 0) {
	// 	result += ` ${hours} hours `;
	// }

	// if (minutes > 0 && days === 0 && hours === 0) {
	// 	result += ` ${minutes} mins`;
	// }

	// if (timestamp > 0 && minutes <= 60 && days === 0 && hours === 0) {
	// 	result += ` ${timestamp} secs`;
	// }

	console.log("result: ", result);
	console.log("timestamp: ", timestamp);

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
