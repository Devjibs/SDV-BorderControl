FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SDV.BorderControl.API.csproj", "."]
RUN dotnet restore "SDV.BorderControl.API.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "SDV.BorderControl.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SDV.BorderControl.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SDV.BorderControl.API.dll"]

