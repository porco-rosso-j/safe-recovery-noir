import { Box, Input, FormControl, Select } from "@chakra-ui/react";
import { inputStyle } from "src/theme";
import { useState } from "react";

const TimelockInput = (props: { setTimelock: (num: number) => void }) => {
	const [time, setTime] = useState<number>(0);
	const [unit, setUnit] = useState<number>(1);

	const handleTimeChange = (num: number) => {
		const seconds = num * unit;
		props.setTimelock(seconds);
		setTime(num);
	};

	const handleUnitChange = (unit: number) => {
		const seconds = time * unit;
		props.setTimelock(seconds);
		setUnit(unit);
	};

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
					onChange={(e) => handleTimeChange(Number(e.target.value))}
				/>
				<Select
					w={"30%"}
					size="xl"
					borderRadius={"2px"}
					sx={{
						textAlign: "center",
						pr: "15px",
						pb: "4px",
					}}
					onChange={(e) => handleUnitChange(Number(e.target.value))}
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

export default TimelockInput;
