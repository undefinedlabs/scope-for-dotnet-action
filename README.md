
# Scope for .NET

GitHub Action to run your tests automatically instrumented with the [Scope .NET agent](https://docs.scope.dev/docs/dotnet-installation).

## About Scope

[Scope](https://scope.dev) gives developers production-level visibility on every test for every app – spanning mobile, monoliths, and microservices.

## Usage

1. Set Scope DSN inside Settings > Secrets as `SCOPE_DSN`.
2. Add a step to your GitHub Actions workflow YAML that uses this action:

```yml
steps:
  - uses: actions/checkout@v1
  - name: Setup .NET Core
    uses: actions/setup-dotnet@v1
    with:
      dotnet-version: 3.0.100
  - name: Build with dotnet
    run: dotnet build
  - name: Scope for .NET
    uses: undefinedlabs/scope-for-dotnet-action@v1
    with:
      dsn: ${{secrets.SCOPE_DSN}} # required
      use-solutions: true  # optional - default is 'true'
      command: dotnet test # optional - default is 'dotnet test'
      
```