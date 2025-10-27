FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 10000

ENV ASPNETCORE_URLS=http://+:10000

USER app
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG configuration=Release
WORKDIR /src
COPY ["MAE-WebAPI/MAE-WebAPI.csproj", "./"]
RUN dotnet restore "MAE-WebAPI/MAE-WebAPI.csproj"
COPY . .
WORKDIR "/src/MAE-WebAPI"
RUN dotnet build "MAE-WebAPI.csproj" -c $configuration -o /app/build

FROM build AS publish
ARG configuration=Release
RUN dotnet publish "MAE-WebAPI.csproj" -c $configuration -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MAE-WebAPI.dll"]
