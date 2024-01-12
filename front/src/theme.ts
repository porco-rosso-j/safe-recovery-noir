import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
	createMultiStyleConfigHelpers(cardAnatomy.keys);

const chakraDefaultTheme = extendTheme({
	styles: {
		global: {
			html: {
				height: "100%",
			},
			body: {
				height: "100%",
				margin: "0",
				padding: "0",
				bg: "linear-gradient(to bottom, #233a28, #00796F)",
				color: "white",
			},
			"#root": {
				height: "100%",
			},
		},
	},
});
export const inputStyle = {
	border: "none",
	borderBottom: "1px solid gray", // Underline style
	borderColor: "gray", // Border color
	outline: "none", // Remove focus outline
	_focus: {
		boxShadow: "none", // Remove focus box shadow
	},
};

export default chakraDefaultTheme;
