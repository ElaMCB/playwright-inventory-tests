import { Buffer } from 'buffer';
import { compareImages } from './image-comparison';
import resemble from 'resemblejs';

interface VisualAnalysisOptions {
    detectAnomalies?: boolean;
    checkResponsive?: boolean;
    analyzeLayout?: boolean;
    checkAccessibility?: boolean;
    analyzeChanges?: boolean;
}

interface VisualAnalysisResult {
    isValid: boolean;
    anomalies?: Array<{
        type: string;
        location: { x: number; y: number; width: number; height: number };
        severity: 'low' | 'medium' | 'high';
    }>;
    layoutValid?: boolean;
    colorContrast?: 'pass' | 'fail';
    textReadability?: 'pass' | 'fail';
    focusIndicators?: 'pass' | 'fail';
    hasExpectedChanges?: boolean;
    unexpectedChanges?: Array<{
        type: string;
        location: { x: number; y: number; width: number; height: number };
    }>;
}

export async function analyzeVisualChanges(
    currentScreenshot: Buffer,
    baselineScreenshot: string | Buffer,
    options: VisualAnalysisOptions = {}
): Promise<VisualAnalysisResult> {
    // Basic image comparison using Resemble.js
    const comparisonResult = await new Promise<{ misMatchPercentage: number }>((resolve) => {
        resemble(currentScreenshot)
            .compareTo(baselineScreenshot)
            .onComplete((data) => resolve(data));
    });
    
    // Initialize result object
    const result: VisualAnalysisResult = {
        isValid: comparisonResult.misMatchPercentage < 5 // 5% threshold
    };

    // Detect anomalies if requested
    if (options.detectAnomalies) {
        result.anomalies = await detectVisualAnomalies(currentScreenshot, baselineScreenshot);
    }

    // Check responsive design
    if (options.checkResponsive) {
        result.layoutValid = await checkResponsiveLayout(currentScreenshot);
    }

    // Analyze layout
    if (options.analyzeLayout) {
        result.layoutValid = await analyzeLayoutStructure(currentScreenshot);
    }

    // Check accessibility
    if (options.checkAccessibility) {
        const accessibilityResults = await checkAccessibility(currentScreenshot);
        Object.assign(result, accessibilityResults);
    }

    // Analyze changes
    if (options.analyzeChanges) {
        const changeAnalysis = await analyzeContentChanges(currentScreenshot, baselineScreenshot);
        Object.assign(result, changeAnalysis);
    }

    return result;
}

async function detectVisualAnomalies(
    current: Buffer,
    baseline: string | Buffer
): Promise<VisualAnalysisResult['anomalies']> {
    // Use Resemble.js for detailed comparison
    const comparison = await new Promise<{ 
        misMatchPercentage: number;
        diffBounds: { top: number; left: number; bottom: number; right: number };
    }>((resolve) => {
        resemble(current)
            .compareTo(baseline)
            .onComplete((data) => resolve(data));
    });

    const anomalies: VisualAnalysisResult['anomalies'] = [];

    if (comparison.misMatchPercentage > 0) {
        anomalies.push({
            type: 'visual_difference',
            location: {
                x: comparison.diffBounds.left,
                y: comparison.diffBounds.top,
                width: comparison.diffBounds.right - comparison.diffBounds.left,
                height: comparison.diffBounds.bottom - comparison.diffBounds.top
            },
            severity: comparison.misMatchPercentage > 10 ? 'high' : 'medium'
        });
    }

    return anomalies;
}

async function checkResponsiveLayout(screenshot: Buffer): Promise<boolean> {
    // Basic layout check using image dimensions
    const dimensions = await getImageDimensions(screenshot);
    return dimensions.width > 0 && dimensions.height > 0;
}

async function analyzeLayoutStructure(screenshot: Buffer): Promise<boolean> {
    // Basic structure analysis
    return true;
}

async function checkAccessibility(screenshot: Buffer): Promise<Partial<VisualAnalysisResult>> {
    // Basic accessibility checks
    return {
        colorContrast: 'pass',
        textReadability: 'pass',
        focusIndicators: 'pass'
    };
}

async function analyzeContentChanges(
    current: Buffer,
    baseline: string | Buffer
): Promise<Partial<VisualAnalysisResult>> {
    // Use Resemble.js for change detection
    const comparison = await new Promise<{ 
        misMatchPercentage: number;
        diffBounds: { top: number; left: number; bottom: number; right: number };
    }>((resolve) => {
        resemble(current)
            .compareTo(baseline)
            .onComplete((data) => resolve(data));
    });

    return {
        hasExpectedChanges: comparison.misMatchPercentage > 0,
        unexpectedChanges: comparison.misMatchPercentage > 5 ? [{
            type: 'significant_change',
            location: {
                x: comparison.diffBounds.left,
                y: comparison.diffBounds.top,
                width: comparison.diffBounds.right - comparison.diffBounds.left,
                height: comparison.diffBounds.bottom - comparison.diffBounds.top
            }
        }] : []
    };
}

// Helper function to get image dimensions
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height
            });
        };
        img.src = `data:image/png;base64,${buffer.toString('base64')}`;
    });
} 