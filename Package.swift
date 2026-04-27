// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "JinOmamori",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "JinOmamori",
            targets: ["JinOmamori"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "JinOmamori",
            dependencies: [],
            path: "ios/JinOmamori",
            exclude: [],
            swiftSettings: [
                .define("DEBUG", .when(configuration: .debug))
            ]
        )
    ]
)
