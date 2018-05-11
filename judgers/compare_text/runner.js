/*
 * File   : runner.js
 * Create : 2018-02-06
*/

let randomstring = require("randomstring");
let Sandbox = require('zoj-sandbox');
let sb = new Sandbox(parseInt(process.argv[2]) || 2333, [
	['/usr/bin', '/usr/bin', true],
	['/usr/share', '/usr/share', true],
	['/usr/lib', '/usr/lib', true],
	['/lib', '/lib', true],
	['/lib64', '/lib64', true],
	['/etc/alternatives/', '/etc/alternatives/', true],
	['/dev', '/dev', true],
	['/proc', '/proc', true],
]);

function runTestcase(data_info, user_info, language, execFile, extraFiles, testcase) {
	sb.reset();

	let file_io_input_name = 'data.in'
	let file_io_output_name = 'data.out'

	if (extraFiles) {
		for (let file of extraFiles) {
			if (typeof file === 'string') sb.put(file);
			else sb.put(file.filename, file.mask, file.targetFilename);
		}
	}

	sb.put(testcase.input, 777, file_io_input_name);

	let program = sb.put(execFile);

	let stderr = randomstring.generate(10);
	let runOptions = {
		program: program,
		file_stdin: '',
		file_stdout: '',
		file_stderr: stderr,
		time_limit: Math.ceil(data_info.config.time_limit / 1000),
		time_limit_reserve: 1,
		memory_limit: data_info.config.memory_limit * 1024,
		memory_limit_reserve: language.minMemory + 32 * 1024,
		large_stack: language.largeStack,
		output_limit: Math.max(data_info.config.output_limit || 0, language.minOutputLimit),
		process_limit: language.minProcessLimit,
		network: false
	};

	runOptions.file_stdin = file_io_input_name;
	runOptions.file_stdout = file_io_output_name;

	let result = sb.run(runOptions);

	return {
		result: result,
		getOutputFile: () => {
			return sb.get(file_io_output_name);
		},
		getStderrFile: () => {
			return sb.get(stderr);
		}
	};
}

function runForSpecialJudge(execFile, extraFiles, language) {
	sb.reset();

	// console.log(arguments);
	// console.log("Exec file: " + execFile);
	let program = sb.put(execFile);

	if (extraFiles) {
		for (let file of extraFiles) {
			if (typeof file === 'string') sb.put(file);
			else {
				if (typeof file.data !== 'undefined') {
					sb.put(Buffer.from(file.data), file.mask, file.targetFilename);
				} else {
					sb.put(file.filename, file.mask, file.targetFilename);
				}
			}
		}
	}

	let runOptions = {
		program: program,
		file_stdout: 'stdout',
		file_stderr: 'stderr',
		time_limit: Math.ceil(config.spj_time_limit / 1000),
		time_limit_reserve: 1,
		memory_limit: config.spj_time_limit * 1024,
		memory_limit_reserve: language.minMemory + 32 * 1024,
		large_stack: language.largeStack,
		output_limit: Math.max(config.spj_message_limit * 2, language.minOutputLimit),
		process_limit: language.minProcessLimit,
		network: false
	};

	return sb.run(runOptions);
}

module.exports = [
	sb,
	runTestcase,
	runForSpecialJudge
];
