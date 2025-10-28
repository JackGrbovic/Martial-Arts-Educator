FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY MAE-WebAPI.csproj .
RUN dotnet restore "MAE-WebAPI.csproj"
COPY . .
RUN dotnet publish "MAE-WebAPI.csproj" -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /publish .

ENTRYPOINT [ "dotnet", "MAE-WebAPI.dll" ]
