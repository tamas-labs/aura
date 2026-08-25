import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('SCSS Integration', () => {
    describe('plugin entry point', () => {
        const indexPath = resolve(__dirname, '../../../index.ts');
        let content: string;

        it('should import SCSS in index.ts', () => {
            content = readFileSync(indexPath, 'utf-8');
            expect(content).toContain("import './src/styles/index.scss'");
        });

        it('should import SCSS before plugin definition', () => {
            content = readFileSync(indexPath, 'utf-8');
            const scssImportIndex = content.indexOf("import './src/styles/index.scss'");
            const pluginDefIndex = content.indexOf('export const AuraPlugin');
            expect(scssImportIndex).toBeLessThan(pluginDefIndex);
            expect(scssImportIndex).toBeGreaterThan(-1);
            expect(pluginDefIndex).toBeGreaterThan(-1);
        });
    });

    describe('package.json configuration', () => {
        const packagePath = resolve(__dirname, '../../../package.json');
        let packageJson: any;

        it('should be parseable', () => {
            expect(() => {
                const content = readFileSync(packagePath, 'utf-8');
                packageJson = JSON.parse(content);
            }).not.toThrow();
        });

        it('should have sass in devDependencies', () => {
            const content = readFileSync(packagePath, 'utf-8');
            packageJson = JSON.parse(content);
            expect(packageJson.devDependencies).toHaveProperty('sass');
        });

        it('should export style.css', () => {
            const content = readFileSync(packagePath, 'utf-8');
            packageJson = JSON.parse(content);
            expect(packageJson.exports).toHaveProperty('./style.css');
            expect(packageJson.exports['./style.css']).toBe('./dist/style.css');
        });
    });

    describe('highlighting utility integration', () => {
        const highlightTextPath = resolve(
            __dirname,
            '../../features/table/utils/formatters/highlightText.ts'
        );
        let content: string;

        it('should use aura-highlight as default class', () => {
            content = readFileSync(highlightTextPath, 'utf-8');
            expect(content).toContain("'aura-highlight'");
        });

        it('should document aura-highlight as default', () => {
            content = readFileSync(highlightTextPath, 'utf-8');
            // Should mention aura-highlight in comments or default value
            expect(content).toMatch(/@default\s+['"]aura-highlight['"]/);
        });
    });

    describe('CSS class naming consistency', () => {
        it('should use consistent aura-highlight class name across files', () => {
            // SCSS component
            const scssContent = readFileSync(
                resolve(__dirname, '../components/_highlight.scss'),
                'utf-8'
            );
            expect(scssContent).toContain('.aura-highlight');

            // TypeScript utility
            const tsContent = readFileSync(
                resolve(__dirname, '../../features/table/utils/formatters/highlightText.ts'),
                'utf-8'
            );
            expect(tsContent).toContain('aura-highlight');
        });
    });

    describe('animation configuration', () => {
        it('should use consistent animation name', () => {
            const animationsContent = readFileSync(
                resolve(__dirname, '../_animations.scss'),
                'utf-8'
            );
            const highlightContent = readFileSync(
                resolve(__dirname, '../components/_highlight.scss'),
                'utf-8'
            );

            // Animation should be defined as aura-fade-out
            expect(animationsContent).toContain('@keyframes aura-fade-out');
            // And used in highlight component
            expect(highlightContent).toContain('aura-fade-out');
        });

        it('should use variables for animation timing', () => {
            const variablesContent = readFileSync(
                resolve(__dirname, '../_variables.scss'),
                'utf-8'
            );
            const highlightContent = readFileSync(
                resolve(__dirname, '../components/_highlight.scss'),
                'utf-8'
            );

            // Duration variable should be defined
            expect(variablesContent).toContain('$aura-highlight-duration');
            // And used in the highlight component
            expect(highlightContent).toContain('$aura-highlight-duration');
        });
    });

    describe('SCSS module system', () => {
        it('should use @use instead of @import', () => {
            const animationsContent = readFileSync(
                resolve(__dirname, '../_animations.scss'),
                'utf-8'
            );
            const highlightContent = readFileSync(
                resolve(__dirname, '../components/_highlight.scss'),
                'utf-8'
            );

            // Modern @use syntax should be used
            expect(animationsContent).toContain('@use');
            expect(highlightContent).toContain('@use');

            // Old @import should not be used
            expect(animationsContent).not.toContain('@import');
            expect(highlightContent).not.toContain('@import');
        });

        it('should use @forward in index', () => {
            const indexContent = readFileSync(resolve(__dirname, '../index.scss'), 'utf-8');

            // Index should forward modules
            expect(indexContent).toContain('@forward');
        });
    });

    describe('variable customization', () => {
        it('should allow variable overrides with !default', () => {
            const variablesContent = readFileSync(
                resolve(__dirname, '../_variables.scss'),
                'utf-8'
            );

            // All variables should have !default for customization
            const variableLines = variablesContent
                .split('\n')
                .filter((line: string) => line.includes('$aura-highlight-'));

            variableLines.forEach((line: string) => {
                if (line.trim() && !line.trim().startsWith('//')) {
                    expect(line).toContain('!default');
                }
            });
        });
    });

    describe('CSS output expectations', () => {
        it('should define proper CSS property structure', () => {
            const highlightContent = readFileSync(
                resolve(__dirname, '../components/_highlight.scss'),
                'utf-8'
            );

            // Should have animation property
            expect(highlightContent).toMatch(/animation:/);
            // Should have padding
            expect(highlightContent).toMatch(/padding:/);
            // Should have border-radius
            expect(highlightContent).toMatch(/border-radius:/);
        });

        it('should define proper keyframe structure', () => {
            const animationsContent = readFileSync(
                resolve(__dirname, '../_animations.scss'),
                'utf-8'
            );

            // Should have start state (0%)
            expect(animationsContent).toMatch(/0%/);
            // Should have end state (100%)
            expect(animationsContent).toMatch(/100%/);
            // Should animate background-color
            expect(animationsContent).toMatch(/background-color:/);
        });
    });

    describe('file organization', () => {
        it('should follow component-based structure', () => {
            const componentsHighlightPath = resolve(__dirname, '../components/_highlight.scss');
            const indexPath = resolve(__dirname, '../index.scss');

            // Component should exist in subdirectory
            expect(() => readFileSync(componentsHighlightPath, 'utf-8')).not.toThrow();

            // Index should reference it
            const indexContent = readFileSync(indexPath, 'utf-8');
            expect(indexContent).toContain('components/highlight');
        });

        it('should use partial naming convention', () => {
            const stylesDir = resolve(__dirname, '..');
            const variablesPath = resolve(stylesDir, '_variables.scss');
            const animationsPath = resolve(stylesDir, '_animations.scss');

            expect(() => readFileSync(variablesPath, 'utf-8')).not.toThrow();
            expect(() => readFileSync(animationsPath, 'utf-8')).not.toThrow();
            // Partials should start with underscore
            expect('_variables.scss').toMatch(/^_/);
            expect('_animations.scss').toMatch(/^_/);
        });
    });
});
