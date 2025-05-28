#!/usr/bin/env node

/**
 * Test script to verify unified evolved components functionality
 */

// Use the test evolve DSL
const testMapText = `title Test Map
component Kettle [0.43, 0.35] label [-57, 4]
evolve Kettle->Electric Kettle 0.62 label [16, 5]`;

console.log("🧪 Testing Unified Evolved Components...");
console.log("📄 Test Map DSL:");
console.log(testMapText);
console.log("\n" + "=".repeat(50) + "\n");

try {
  // Import the modules we need to test
  const {
    UnifiedConverter,
  } = require("./frontend/src/conversion/UnifiedConverter.ts");
  const {
    UnifiedMapElements,
  } = require("./frontend/src/processing/UnifiedMapElements.ts");

  console.log("✅ Modules loaded successfully");

  // Create feature switches mock
  const featureSwitches = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: true,
  };

  // Test the conversion
  const converter = new UnifiedConverter(featureSwitches);
  const result = converter.parse(testMapText);

  console.log("📊 Conversion Results:");
  console.log("- Components:", result.components?.length || 0);
  console.log("- Evolved elements:", result.evolved?.length || 0);
  console.log("- Pipelines:", result.pipelines?.length || 0);

  if (result.components && result.components.length > 0) {
    console.log("\n📦 Components:");
    result.components.forEach((comp, i) => {
      console.log(
        `  ${i + 1}. ${comp.name} [${comp.visibility}, ${
          comp.maturity
        }] evolving: ${comp.evolving || false}`
      );
    });
  }

  if (result.evolved && result.evolved.length > 0) {
    console.log("\n⚡ Evolved Elements:");
    result.evolved.forEach((evolved, i) => {
      console.log(
        `  ${i + 1}. ${evolved.name} -> maturity: ${evolved.maturity}`
      );
    });
  }

  // Test UnifiedMapElements processing
  console.log("\n🔄 Testing UnifiedMapElements processing...");
  const mapElements = new UnifiedMapElements(result);

  console.log("- All components:", mapElements.allComponents.length);
  console.log("- Evolved elements:", mapElements.evolvedElements.length);
  console.log(
    "- Evolving components:",
    mapElements.getEvolvingComponents().length
  );
  console.log(
    "- Evolved components:",
    mapElements.getEvolvedComponents().length
  );

  // Test legacy compatibility methods
  console.log("\n🔄 Testing legacy compatibility...");
  const evolveElements = mapElements.getEvolveElements();
  const evolvedElements = mapElements.getEvolvedElements();

  console.log("- Legacy getEvolveElements():", evolveElements.length);
  console.log("- Legacy getEvolvedElements():", evolvedElements.length);

  if (evolveElements.length > 0) {
    console.log("\n📋 Evolving Elements (legacy format):");
    evolveElements.forEach((elem, i) => {
      console.log(
        `  ${i + 1}. ${elem.name} - evolving: ${
          elem.evolving
        }, evolveMaturity: ${elem.evolveMaturity}`
      );
    });
  }

  if (evolvedElements.length > 0) {
    console.log("\n📋 Evolved Elements (legacy format):");
    evolvedElements.forEach((elem, i) => {
      console.log(
        `  ${i + 1}. ${elem.name} - evolved: ${elem.evolved}, maturity: ${
          elem.maturity
        }`
      );
    });
  }

  // Validate the results
  let errors = [];

  if (!result.components || result.components.length === 0) {
    errors.push("No components found in conversion result");
  }

  if (!result.evolved || result.evolved.length === 0) {
    errors.push("No evolved elements found in conversion result");
  }

  if (mapElements.allComponents.length === 0) {
    errors.push("UnifiedMapElements has no components");
  }

  if (mapElements.getEvolvingComponents().length === 0) {
    errors.push("No evolving components found");
  }

  if (mapElements.getEvolvedComponents().length === 0) {
    errors.push("No evolved components found");
  }

  if (errors.length > 0) {
    console.log("\n❌ Test Failed:");
    errors.forEach((error) => console.log(`  - ${error}`));
    process.exit(1);
  } else {
    console.log(
      "\n✅ All tests passed! Evolved components functionality is working correctly."
    );
  }
} catch (error) {
  console.error("❌ Test failed with error:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
