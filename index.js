const core = require('@actions/core');
const OpenAI = require('openai');

async function run() {
  try {
    const apiKey = core.getInput('api_key');
    const prompt = core.getInput('prompt');
    let rawDiff = core.getInput('git_diff');
    const rawDiffFile = core.getInput('git_diff_file');
    const path = require('path');

    if (rawDiffFile) {
      const filePath = path.join(__dirname, rawDiffFile);
      const fs = require('fs');
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
