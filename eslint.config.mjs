import { next } from '@jubstaaa/config/eslint/next'
import { defineConfig } from 'eslint/config'

export default defineConfig([...next({ tsconfigRootDir: import.meta.dirname })])
