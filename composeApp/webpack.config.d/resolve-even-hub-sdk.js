/*
 * Webpack configuration for Kotlin/JS + Kotlin/Wasm webpack bundles.
 *
 * 背景：even_hub_sdk 现在使用 npm 包 @evenrealities/even_hub_sdk。
 * 需要配置 webpack 来正确解析 scoped package。
 * 
 * 注意：__dirname 在构建时指向 build/js/packages/InNovel-composeApp/webpack.config.js
 * 需要向上查找多个层级才能到达项目根目录。
 */

const path = require("path");
const fs = require("fs");

config.resolve = config.resolve || {};
config.resolve.alias = config.resolve.alias || {};

// 查找项目根目录（包含 node_modules 的目录）
// 从 webpack.config.js 的位置向上查找，直到找到包含 node_modules 的目录
function findProjectRoot(startPath) {
    let currentPath = startPath;
    let depth = 0;
    const maxDepth = 10; // 防止无限循环
    
    while (currentPath !== path.dirname(currentPath) && depth < maxDepth) {
        const nodeModulesPath = path.join(currentPath, "node_modules");
        if (fs.existsSync(nodeModulesPath)) {
            return currentPath;
        }
        currentPath = path.dirname(currentPath);
        depth++;
    }
    
    // 如果找不到，尝试从常见的位置查找
    // build/js/packages/InNovel-composeApp -> 项目根 (向上7层)
    // build/wasm/packages/InNovel-composeApp -> 项目根 (向上7层)
    const fallbackRoot = path.resolve(__dirname, "../../../../../../..");
    if (fs.existsSync(path.join(fallbackRoot, "node_modules"))) {
        return fallbackRoot;
    }
    
    // 最后的回退：假设项目根在 composeApp 的父目录
    return path.resolve(__dirname, "../../../..");
}

const projectRoot = findProjectRoot(__dirname);
const rootNodeModules = path.join(projectRoot, "node_modules");
const sdkPath = path.join(rootNodeModules, "@evenrealities", "even_hub_sdk");

// 验证路径是否存在
if (fs.existsSync(sdkPath)) {
    // 为 scoped package 添加 alias，确保 webpack 能正确解析
    config.resolve.alias["@evenrealities/even_hub_sdk"] = sdkPath;
    
    // 添加 node_modules 路径到解析列表（确保依赖能正确解析）
    config.resolve.modules = config.resolve.modules || ["node_modules"];
    if (!config.resolve.modules.includes(rootNodeModules)) {
        config.resolve.modules.push(rootNodeModules);
    }
} else {
    console.warn(`Warning: Could not find @evenrealities/even_hub_sdk at ${sdkPath}`);
    console.warn(`Project root resolved to: ${projectRoot}`);
    console.warn(`__dirname is: ${__dirname}`);
}