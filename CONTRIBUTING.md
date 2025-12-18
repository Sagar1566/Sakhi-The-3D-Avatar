# Contributing to Sakhi - The 3D Avatar

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why is this enhancement needed?
- **Proposed solution**
- **Alternative solutions** considered

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 8+
- Python 3.11+
- UV package manager

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Sakhi-The-3D-Avatar.git
cd Sakhi-The-3D-Avatar

# Install dependencies
pnpm monorepo-setup

# Copy environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start development servers
pnpm dev
```

## Coding Standards

### JavaScript/TypeScript

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful variable names
- Add JSDoc comments for complex functions

```typescript
/**
 * Processes user input and generates AI response
 * @param input - User's text input
 * @param context - Conversation context
 * @returns AI-generated response
 */
async function processInput(input: string, context: Context): Promise<string> {
    // Implementation
}
```

### Python

- Follow PEP 8 style guide
- Use Black for formatting
- Add type hints
- Write docstrings

```python
def process_audio(audio_data: bytes, sample_rate: int = 16000) -> dict:
    """
    Process audio data and extract features.
    
    Args:
        audio_data: Raw audio bytes
        sample_rate: Audio sample rate in Hz
        
    Returns:
        Dictionary containing processed audio features
    """
    # Implementation
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper TypeScript types
- Implement error boundaries

```tsx
interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
    onClick, 
    children, 
    variant = 'primary' 
}) => {
    return (
        <button 
            onClick={onClick}
            className={`btn btn-${variant}`}
        >
            {children}
        </button>
    );
};
```

## Testing

### Running Tests

```bash
# Lint check
pnpm lint

# Format check
pnpm format:check

# Build test
pnpm build
```

### Writing Tests

- Write tests for new features
- Maintain or improve code coverage
- Test edge cases
- Mock external dependencies

## Commit Messages

Follow conventional commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(avatar): add lip sync functionality

Implemented viseme-based lip synchronization for the 3D avatar
using audio timing data from the TTS engine.

Closes #123
```

```
fix(websocket): resolve connection timeout issue

Added exponential backoff retry logic to handle intermittent
connection failures.

Fixes #456
```

## Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/what-changed` - Documentation
- `refactor/what-changed` - Code refactoring
- `chore/what-changed` - Maintenance

## Pull Request Process

1. **Update Documentation**: Update README.md if needed
2. **Add Tests**: Include tests for new features
3. **Run Linting**: Ensure `pnpm lint` passes
4. **Format Code**: Run `pnpm format`
5. **Build Check**: Ensure `pnpm build` succeeds
6. **Update Changelog**: Add entry to CHANGELOG.md
7. **Request Review**: Request review from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

## Project Structure

```
Sakhi-The-3D-Avatar/
├── apps/
│   ├── client/          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/     # App router pages
│   │   │   ├── components/  # React components
│   │   │   ├── contexts/    # React contexts
│   │   │   └── types/       # TypeScript types
│   │   └── public/      # Static assets
│   │
│   └── server/          # FastAPI backend
│       └── main.py      # Main application file
│
├── .github/
│   └── workflows/       # CI/CD pipelines
└── docs/                # Documentation
```

## Adding New Features

### Frontend Feature

1. Create component in `apps/client/src/components/`
2. Add types in `apps/client/src/types/`
3. Update context if needed
4. Add to appropriate page
5. Test thoroughly

### Backend Feature

1. Add endpoint in `apps/server/main.py`
2. Add type hints
3. Update API documentation
4. Test with FastAPI docs (`/docs`)

### Full-Stack Feature

1. Design API contract first
2. Implement backend endpoint
3. Test backend independently
4. Implement frontend
5. Test integration
6. Update documentation

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Provide context in description
- Respond to feedback promptly
- Be open to suggestions

### For Reviewers

- Be respectful and constructive
- Focus on code, not the person
- Explain reasoning for suggestions
- Approve when satisfied

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. Push tag to trigger CI/CD
5. Create GitHub release
6. Deploy to production

## Getting Help

- **Documentation**: Check README.md and docs/
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions
- **Discord**: Join our community server (if available)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Sakhi - The 3D Avatar! 🎉
