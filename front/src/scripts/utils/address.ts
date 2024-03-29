export function shortenAddress(address: string) {
	return (
		address.substring(0, 6) + "..." + address.substring(address.length - 5)
	);
}

export function shortenAddressS(address: string) {
	return (
		address.substring(0, 5) + "..." + address.substring(address.length - 4)
	);
}

export function shortenTxHash(address: string) {
	return (
		address.substring(0, 8) + "..." + address.substring(address.length - 8)
	);
}
