ARG DOTNET_VERSION=8.0

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS builder

WORKDIR /app

COPY ProductService.csproj .

RUN dotnet restore

COPY . .

RUN dotnet publish -c Release -o out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION}

WORKDIR /app

COPY --from=builder /app/out .

EXPOSE 5001

CMD ["dotnet","ProductService.dll"]

