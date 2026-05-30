import {importWardleyMapFromMermaid} from '../../utils/mermaidWardleyImport';

describe('importWardleyMapFromMermaid', () => {
    it('imports Mermaid Wardley syntax into OWM DSL', () => {
        const mermaid = `\`\`\`mermaid
wardley-beta
title Tea Shop
size [1200, 700]
evolution Genesis -> Custom -> Product -> Commodity
annotations [0.9, 0.1]
annotation 1,[0.4, 0.5] "Key dependency"
anchor User [0.95, 0.95]
component Kettle [0.45, 0.57] (buy) (inertia)
pipeline Kettle {
  component "Pipeline Component 1" [0.3]
  component "Pipeline Component 2" [0.6]
}
User +> Kettle
"Pipeline Component 1" -> Kettle
evolve Kettle 0.82
note "Needs review" [0.55, 0.4]
\`\`\``;

        const imported = importWardleyMapFromMermaid(mermaid);

        expect(imported).toBe(`title Tea Shop
size [1200, 700]
evolution Genesis->Custom->Product->Commodity
annotations [0.9, 0.1]
annotation 1 [0.4, 0.5] Key dependency
anchor User [0.95, 0.95]
component Kettle [0.45, 0.57] (buy) (inertia)
pipeline Kettle
{
  component Pipeline Component 1 [0.3]
  component Pipeline Component 2 [0.6]
}
User+>Kettle
Pipeline Component 1->Kettle
evolve Kettle 0.82
note "Needs review" [0.55, 0.4]`);
    });

    it('supports quoted names and comments', () => {
        const mermaid = `%% comment
wardley-beta
anchor "End User" [0.92, 0.88]
component "Payments/API" [0.52, 0.61]
"End User" +> "Payments/API"`;

        const imported = importWardleyMapFromMermaid(mermaid);

        expect(imported).toBe(`anchor End User [0.92, 0.88]
component "Payments/API" [0.52, 0.61]
End User+>"Payments/API"`);
    });

    it('preserves label offsets on component lines', () => {
        const mermaid = `wardley-beta
component PUBLISHING_INDUSTRY [0.93, 0.62] label [-14, -25]`;

        const imported = importWardleyMapFromMermaid(mermaid);

        expect(imported).toBe('component "PUBLISHING_INDUSTRY" [0.93, 0.62] label [-14, -25]');
    });

    it('throws a line-specific error for unsupported syntax', () => {
        expect(() =>
            importWardleyMapFromMermaid(`wardley-beta
foo bar`),
        ).toThrow('Line 2: Unsupported Mermaid Wardley syntax.');
    });
});
