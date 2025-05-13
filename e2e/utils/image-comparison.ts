import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

interface ComparisonResult {
    matchingPercentage: number;
    diffImage?: Buffer;
    differences: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
}

export async function compareImages(
    current: Buffer,
    baseline: string | Buffer
): Promise<ComparisonResult> {
    // Load images
    const currentImage = PNG.sync.read(current);
    const baselineImage = baseline instanceof Buffer
        ? PNG.sync.read(baseline)
        : PNG.sync.read(fs.readFileSync(baseline));

    // Create diff image
    const { width, height } = currentImage;
    const diff = new PNG({ width, height });

    // Compare images
    const numDiffPixels = pixelmatch(
        currentImage.data,
        baselineImage.data,
        diff.data,
        width,
        height,
        {
            threshold: 0.1,
            includeAA: true
        }
    );

    // Calculate matching percentage
    const totalPixels = width * height;
    const matchingPercentage = ((totalPixels - numDiffPixels) / totalPixels) * 100;

    // Find difference regions
    const differences = findDifferenceRegions(diff.data, width, height);

    return {
        matchingPercentage,
        diffImage: PNG.sync.write(diff),
        differences
    };
}

function findDifferenceRegions(
    diffData: Buffer,
    width: number,
    height: number
): Array<{ x: number; y: number; width: number; height: number }> {
    const differences: Array<{ x: number; y: number; width: number; height: number }> = [];
    const visited = new Set<number>();

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            // Check if pixel is different and not visited
            if (diffData[idx + 3] > 0 && !visited.has(idx)) {
                const region = findConnectedRegion(diffData, width, height, x, y, visited);
                if (region) {
                    differences.push(region);
                }
            }
        }
    }

    return differences;
}

function findConnectedRegion(
    diffData: Buffer,
    width: number,
    height: number,
    startX: number,
    startY: number,
    visited: Set<number>
): { x: number; y: number; width: number; height: number } | null {
    let minX = startX;
    let minY = startY;
    let maxX = startX;
    let maxY = startY;
    const queue: Array<[number, number]> = [[startX, startY]];
    visited.add(startY * width + startX);

    while (queue.length > 0) {
        const [x, y] = queue.shift()!;
        const idx = (y * width + x) * 4;

        // Update bounds
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);

        // Check neighboring pixels
        const neighbors = [
            [x + 1, y], [x - 1, y],
            [x, y + 1], [x, y - 1]
        ];

        for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = (ny * width + nx) * 4;
                if (diffData[nidx + 3] > 0 && !visited.has(nidx)) {
                    queue.push([nx, ny]);
                    visited.add(nidx);
                }
            }
        }
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
} 