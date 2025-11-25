export class SoftAssert {
    private errors: string[] = [];

    public assertTrue(condition: boolean, message: string): void {
        if (!condition) {
            this.errors.push(message);
        }
    }

    public assertFalse(condition: boolean, message: string): void {
        this.assertTrue(!condition, message);
    }

    public assertEquals(actual: unknown, expected: unknown, message: string): void {
        if (actual !== expected) {
            this.errors.push(`${message}. Expected: ${expected}, Actual: ${actual}`);
        }
    }

    public assertNotNull(value: unknown, message: string): void {
        if (value === null || value === undefined) {
            this.errors.push(message);
        }
    }

    public assertNull(value: unknown, message: string): void {
        if (value !== null && value !== undefined) {
            this.errors.push(message);
        }
    }

    public fail(message: string): void {
        this.errors.push(message);
    }

    public resetErrors(): void {
        this.errors = [];
    }

    public getErrors(): string[] {
        return [...this.errors];
    }

    public hasErrors(): boolean {
        return this.errors.length > 0;
    }

    public throwIfErrors(): void {
        if (this.hasErrors()) {
            const errorMessage = this.errors.join('\n');
            this.resetErrors();
            throw new Error(`Soft assertion failures:\n${errorMessage}`);
        }
    }
}

