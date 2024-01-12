import { Box, Input, FormControl, Select } from "@chakra-ui/react";
import { inputStyle } from "src/theme";
import { useState } from "react";

const DelayInputForm = (props: { setDelayValue: (num: number) => void }) => {
	const [unit, setUnit] = useState<number>(1);

	return (
		<FormControl>
			<Box display="flex" alignItems="center">
				<Input
					sx={inputStyle}
					textAlign="center"
					size="xl"
					mr="10px"
					type="number"
					placeholder="10"
					onChange={(e) => props.setDelayValue(Number(e.target.value) * unit)}
				/>
				<Select
					w={"30%"}
					size="xl"
					borderRadius={"2px"}
					sx={{
						textAlign: "center", // Center the text horizontally
						pr: "15px", // Add padding on the left side
						pb: "4px",
					}}
					onChange={(e) => setUnit(Number(e.target.value))}
				>
					<option value="1">sec</option>
					<option value="60">min</option>
					<option value="3600">hour</option>
					<option value="86400">day</option>
				</Select>
			</Box>
		</FormControl>
	);
};

export default DelayInputForm;
