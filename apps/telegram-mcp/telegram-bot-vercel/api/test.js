// Bundled with esbuild

// src/api/helpers/test.ts
var testValue = "Hello from _utils/test";
function testFunction() {
  return "Test function works!";
}

// src/api/test.ts
async function handler(req, res) {
  res.status(200).json({
    ok: true,
    testValue,
    testFunctionResult: testFunction()
  });
}
export {
  handler as default
};
