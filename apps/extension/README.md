# AlgoLens Code Intelligence

**Analyze. Optimize. Accelerate.**

AlgoLens is a Visual Studio Code extension for understanding, analyzing, and improving code directly inside VS Code.

It brings code intelligence into one place with static analysis, complexity insights, security checks, optimization workflows, documentation, benchmarking, visualization, and analysis history.

## Dashboard

AlgoLens provides an interactive developer dashboard with:

- Static analysis overview
- Complexity metrics
- Code quality insights
- Detailed analysis results
- Complexity history and trend visualization
- Persistent local analysis history
- Automatic dashboard refresh when files are saved
- Workspace-aware analysis

## Current Features

### Static Code Analysis

Analyze the currently selected source file and inspect useful code-quality metrics, including:

- Cyclomatic complexity
- Code structure information
- Static analysis results
- Code-quality signals
- Analysis details

### Analysis History

AlgoLens stores analysis results locally so previous analyses can be viewed through history and trend visualizations.

Analysis history is stored locally on the user's machine.

### Automatic Analysis Refresh

When a source file is saved, the AlgoLens dashboard automatically refreshes the analysis and updates the displayed results.

### VS Code Integration

AlgoLens integrates directly with Visual Studio Code through dedicated commands and an interactive dashboard.

Available commands:

- **AlgoLens: Show Extension Info**
- **AlgoLens: Show Workspace Context**
- **AlgoLens: Show Dashboard**

## Roadmap

AlgoLens is being developed toward a complete code-intelligence and developer-assistance experience inside Visual Studio Code.

Planned and ongoing capabilities include:

- Runtime and performance analysis
- Memory analysis
- Benchmarking
- Security scanning
- Bug detection
- Code-smell detection
- AI-assisted optimization
- One-click code improvements
- Documentation generation
- Reports and exports
- Advanced visualizations
- AI developer assistance
- Richer VS Code integration

## Installation

### Visual Studio Code Marketplace

Install **AlgoLens Code Intelligence** directly from the Visual Studio Code Marketplace.

### From Source

Clone the repository:

```bash
git clone https://github.com/salam-codezhub/AlgoLens.git
cd AlgoLens
npm install
npm run build
Development

From the repository root:

npm install
npm run build

For local extension testing, package the extension as a VSIX and install it in Visual Studio Code.

Repository

Source code, issues, feature discussions, and development are available on GitHub:

https://github.com/salam-codezhub/AlgoLens

Contributing

Contributions are welcome.

You can contribute by:

Reporting bugs
Suggesting features
Improving documentation
Improving analysis capabilities
Fixing issues
Submitting pull requests

Before making significant changes, please open an issue to discuss the proposed change when appropriate.

License

AlgoLens is released under the MIT License.

See the LICENSE file for the full license text.

Project Status

AlgoLens is actively under development.

Features and APIs may change as the project evolves. Feedback, bug reports, and contributions are welcome.
```
