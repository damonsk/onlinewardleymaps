// Browser console script to verify SVG duplication fix
// Run this in the browser console after loading the test map

function verifyNoDuplication() {
  console.log("=== SVG Duplication Fix Verification ===");

  // Get all SVG elements
  const svg = document.querySelector("svg");
  if (!svg) {
    console.error("No SVG found on page");
    return;
  }

  // Get methods and elements groups
  const methodsGroup = svg.querySelector('g[id="methods"]');
  const elementsGroup = svg.querySelector('g[id="elements"]');

  if (!methodsGroup) {
    console.error("Methods group not found");
    return;
  }

  if (!elementsGroup) {
    console.error("Elements group not found");
    return;
  }

  // Get all method elements (should include components with method decorators)
  const methodElements = methodsGroup.querySelectorAll('[id^="method_"]');
  console.log(
    `Found ${methodElements.length} method elements in methods group:`
  );
  methodElements.forEach((el) => {
    console.log(`  - ${el.id}`);
  });

  // Get all regular elements
  const regularElements = elementsGroup.querySelectorAll(
    '[id^="element_"], [id^="component_"]'
  );
  console.log(
    `Found ${regularElements.length} regular elements in elements group:`
  );
  regularElements.forEach((el) => {
    console.log(`  - ${el.id}`);
  });

  // Check for duplication by looking for components that appear in both sections
  const methodComponentIds = Array.from(methodElements).map((el) => {
    // Extract component ID from method element ID
    return el.id.replace("method_", "");
  });

  const regularComponentIds = Array.from(regularElements).map((el) => {
    // Extract component ID from element ID
    return el.id.replace(/^(element_|component_)/, "");
  });

  console.log("Method component IDs:", methodComponentIds);
  console.log("Regular component IDs:", regularComponentIds);

  // Find duplicates
  const duplicates = methodComponentIds.filter((id) =>
    regularComponentIds.includes(id)
  );

  if (duplicates.length > 0) {
    console.error(
      `❌ DUPLICATION DETECTED! Components appearing in both sections:`,
      duplicates
    );
    return false;
  } else {
    console.log("✅ NO DUPLICATION DETECTED! Fix is working correctly.");
    return true;
  }
}

// Run the verification
verifyNoDuplication();
