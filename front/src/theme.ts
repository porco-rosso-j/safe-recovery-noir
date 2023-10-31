import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
	createMultiStyleConfigHelpers(cardAnatomy.keys);

// const cardTheme = defineMultiStyleConfig({ variants });
const chakraDefaultTheme = extendTheme({
	styles: {
		global: {
			body: {
				//bg: "#233a28",
				bg: "linear-gradient(to bottom, #233a28, #00796F)",
				//bg: "radial-gradient(circle, #233a28, #67A286)",
				//bg: "conic-gradient(from 45deg,  #233a28,  #00796F, #233a28, #00796F);",
				//bg: "repeating-linear-gradient(45deg, #233a28, #00796F 30px);",
				// background:
				// 	"linear-gradient(45deg, #ff5733, #00796F), radial-gradient(circle, #ff5733, #00796F)",
				// bg: "linear-gradient(to bottom, #233a28 0%, #00796F 100%)",
				//bg: "linear-gradient(to bottom, rgba(35, 58, 40, 1) 0%, rgba(0, 121, 111, 1) 100%)",

				color: "white",
			},
		},
	},
	// components: {
	// 	Button: {
	// 		// Define a style variant for your buttons
	// 		// baseStyle: {
	// 		// Set the background color, text color, and other styles for the button
	// 		//bg: "teal.500",
	// 		bg: "#233a28",
	// 		color: "#233a28",
	// 		colorScheme: "#233a28",
	// 		_hover: {
	// 			// Define styles for hover state
	// 			// bg: "teal.600",
	// 			bg: "#233a28",
	// 		},
	// 		// },
	// 	},
	// },
});

export default chakraDefaultTheme;
