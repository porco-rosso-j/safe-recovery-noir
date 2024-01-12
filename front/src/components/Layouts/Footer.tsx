import { Box, Text, Link } from "@chakra-ui/react";

export default function Footer() {
	return (
		<Box textAlign="center" py={6} as="u" width="100%">
			<Link
				href="https://github.com/porco-rosso-j/safe-recovery-noir"
				isExternal
			>
				<Text fontSize="md">github</Text>
			</Link>
		</Box>
	);
}
