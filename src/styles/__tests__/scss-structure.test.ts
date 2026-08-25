import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('SCSS Structure', () => {
    const stylesDir = resolve(__dirname, '..');

    describe('file existence', () => {
        it('should have variables file', () => {
            const path = resolve(stylesDir, '_variables.scss');
            expect(existsSync(path)).toBe(true);
        });

        it('should have animations file', () => {
            const path = resolve(stylesDir, '_animations.scss');
            expect(existsSync(path)).toBe(true);
        });

        it('should have highlight component file', () => {
            const path = resolve(stylesDir, 'components/_highlight.scss');
            expect(existsSync(path)).toBe(true);
        });

        it('should have index file', () => {
            const path = resolve(stylesDir, 'index.scss');
            expect(existsSync(path)).toBe(true);
        });
    });

    describe('_variables.scss', () => {
        const variablesPath = resolve(stylesDir, '_variables.scss');
        let content: string;

        it('should be readable', () => {
            expect(() => {
                content = readFileSync(variablesPath, 'utf-8');
            }).not.toThrow();
        });

        it('should define highlight background color variable', () => {
            content = readFileSync(variablesPath, 'utf-8');
            expect(content).toContain('$aura-highlight-bg');
        });

        it('should define highlight text color variable', () => {
            content = readFileSync(variablesPath, 'utf-8');
            expect(content).toContain('$aura-highlight-color');
        });

        it('should define highlight duration variable', () => {
            content = readFileSync(variablesPath, 'utf-8');
            expect(content).toContain('$aura-highlight-duration');
        });

        it('should use !default flag for variables', () => {
            content = readFileSync(variablesPath, 'utf-8');
            expect(content).toMatch(/\$aura-highlight-bg:.*!default/);
            expect(content).toMatch(/\$aura-highlight-color:.*!default/);
            expect(content).toMatch(/\$aura-highlight-duration:.*!default/);
        });
    });

    describe('_animations.scss', () => {
        const animationsPath = resolve(stylesDir, '_animations.scss');
        let content: string;

        it('should be readable', () => {
            expect(() => {
                content = readFileSync(animationsPath, 'utf-8');
            }).not.toThrow();
        });

        it('should import variables module', () => {
            content = readFileSync(animationsPath, 'utf-8');
            expect(content).toMatch(/@use.*variables/);
        });

        it('should define aura-fade-out keyframes', () => {
            content = readFileSync(animationsPath, 'utf-8');
            expect(content).toContain('@keyframes aura-fade-out');
        });

        it('should have 0% keyframe with background color', () => {
            content = readFileSync(animationsPath, 'utf-8');
            expect(content).toMatch(/0%[\s\S]*?background-color/);
        });

        it('should have 100% keyframe with transparent background', () => {
            content = readFileSync(animationsPath, 'utf-8');
            expect(content).toMatch(/100%[\s\S]*?background-color:\s*transparent/);
        });

        it('should use $aura-highlight-bg variable in animation', () => {
            content = readFileSync(animationsPath, 'utf-8');
            expect(content).toContain('$aura-highlight-bg');
        });

        it('should use $aura-highlight-color variable in animation', () => {
            content = readFileSync(animationsPath, 'utf-8');
            expect(content).toContain('$aura-highlight-color');
        });
    });

    describe('components/_highlight.scss', () => {
        const highlightPath = resolve(stylesDir, 'components/_highlight.scss');
        let content: string;

        it('should be readable', () => {
            expect(() => {
                content = readFileSync(highlightPath, 'utf-8');
            }).not.toThrow();
        });

        it('should import variables module', () => {
            content = readFileSync(highlightPath, 'utf-8');
            expect(content).toMatch(/@use.*variables/);
        });

        it('should import animations module', () => {
            content = readFileSync(highlightPath, 'utf-8');
            expect(content).toMatch(/@use.*animations/);
        });

        it('should define .aura-highlight class', () => {
            content = readFileSync(highlightPath, 'utf-8');
            expect(content).toMatch(/\.aura-highlight\s*{/);
        });

        it('should apply aura-fade-out animation', () => {
            content = readFileSync(highlightPath, 'utf-8');
            expect(content).toMatch(/animation:.*aura-fade-out/);
        });

        it('should use $aura-highlight-duration variable', () => {
            content = readFileSync(highlightPath, 'utf-8');
            expect(content).toContain('$aura-highlight-duration');
        });

        it('should have ease-out timing function', () => {
            content = readFileSync(highlightPath, 'utf-8');
            expect(content).toMatch(/animation:.*ease-out/);
        });

        it('should have forwards fill mode', () => {
            content = readFileSync(highlightPath, 'utf-8');
            expect(content).toMatch(/animation:.*forwards/);
        });
    });

    describe('index.scss', () => {
        const indexPath = resolve(stylesDir, 'index.scss');
        let content: string;

        it('should be readable', () => {
            expect(() => {
                content = readFileSync(indexPath, 'utf-8');
            }).not.toThrow();
        });

        it('should forward variables module', () => {
            content = readFileSync(indexPath, 'utf-8');
            expect(content).toMatch(/@forward.*variables/);
        });

        it('should forward animations module', () => {
            content = readFileSync(indexPath, 'utf-8');
            expect(content).toMatch(/@forward.*animations/);
        });

        it('should forward highlight component', () => {
            content = readFileSync(indexPath, 'utf-8');
            expect(content).toMatch(/@forward.*components\/highlight/);
        });
    });

    describe('SCSS syntax validation', () => {
        it('should not contain syntax errors in variables', () => {
            const content = readFileSync(resolve(stylesDir, '_variables.scss'), 'utf-8');
            // Check for basic SCSS syntax
            expect(content).toContain('$aura-highlight-bg:');
            expect(content).toContain(';');
        });

        it('should not contain syntax errors in animations', () => {
            const content = readFileSync(resolve(stylesDir, '_animations.scss'), 'utf-8');
            // Check for basic keyframes syntax
            expect(content).toMatch(/@keyframes\s+[\w-]+\s*{/);
        });

        it('should not contain syntax errors in highlight', () => {
            const content = readFileSync(resolve(stylesDir, 'components/_highlight.scss'), 'utf-8');
            // Check for basic class syntax
            expect(content).toMatch(/\.[\w-]+\s*{/);
        });
    });

    describe('module dependencies', () => {
        it('should have correct @use paths in animations', () => {
            const content = readFileSync(resolve(stylesDir, '_animations.scss'), 'utf-8');
            // Should use relative path to variables
            expect(content).toMatch(/@use\s+["']variables["']/);
        });

        it('should have correct @use paths in highlight component', () => {
            const content = readFileSync(resolve(stylesDir, 'components/_highlight.scss'), 'utf-8');
            // Should use parent directory path to variables
            expect(content).toMatch(/@use\s+["']\.\.\/variables["']/);
            expect(content).toMatch(/@use\s+["']\.\.\/animations["']/);
        });

        it('should have correct @forward paths in index', () => {
            const content = readFileSync(resolve(stylesDir, 'index.scss'), 'utf-8');
            expect(content).toMatch(/@forward\s+["']variables["']/);
            expect(content).toMatch(/@forward\s+["']animations["']/);
            expect(content).toMatch(/@forward\s+["']components\/highlight["']/);
        });
    });
});
