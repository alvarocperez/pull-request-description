/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 463:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 900:
/***/ ((module) => {

module.exports = eval("require")("openai");


/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(463);
const OpenAI = __nccwpck_require__(900);

async function run() {
  try {
    const apiKey = core.getInput('api_key');
    const prompt = core.getInput('prompt');
    let rawDiff = core.getInput('git_diff');
    const rawDiffFile = core.getInput('git_diff_file');

    if (rawDiffFile) {
      const filePath = path.join(__dirname, rawDiffFile);
      const fs = __nccwpck_require__(896);
      rawDiff = fs.readFileSync(filePath, 'utf8');
    }

    // Decodificar y sanitizar el diff
    const gitDiff = decodeURIComponent(rawDiff)
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      messages: [{
        role: "system",
        content: "You are an expert code review assistant. Generate a clear and concise description for a Pull Request based on the changes provided using a valid Markdown."
      },{
        role: "user",
        content: `${prompt}\n\nDIFF:\n\`\`\`diff\n${gitDiff}\n\`\`\``
      }],
      model: "gpt-4-turbo",
      temperature: 0.7,
      max_tokens: 4096
    });

    const description = completion.choices[0].message.content
      .replace(/```/g, '\\`\\`\\`')  // Escapar code blocks
      .replace(/\${/g, '\\${');      // Escapar template literals

    core.setOutput('description', description);

  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();

module.exports = __webpack_exports__;
/******/ })()
;