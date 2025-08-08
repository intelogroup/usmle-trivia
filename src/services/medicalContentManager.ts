/**
 * Medical Content Management System
 * Integrates validation, quality control, and content lifecycle management
 */

import { medicalContentValidator, type ValidationResult } from './medicalContentValidator';
import { quizService } from './quiz';
import type { QuestionData } from '../data/sampleQuestions';
import type { Question } from './quiz';

export interface ContentQualityReport {
  questionId: string;
  status: 'approved' | 'needs_review' | 'rejected';
  validationResult: ValidationResult;
  reviewDate: Date;
  reviewerNotes?: string;
}

export interface ContentApprovalWorkflow {
  autoApprove: boolean;
  minimumScore: number;
  requireMedicalReview: boolean;
  blockCriticalErrors: boolean;
}

export interface MedicalContentMetrics {
  totalQuestions: number;
  approvedQuestions: number;
  averageQualityScore: number;
  categoryDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  commonValidationIssues: string[];
  medicalAccuracyTrend: number[];
  educationalValueTrend: number[];
}

export class MedicalContentManager {
  private approvalWorkflow: ContentApprovalWorkflow = {
    autoApprove: false,
    minimumScore: 75,
    requireMedicalReview: true,
    blockCriticalErrors: true
  };

  private contentReports = new Map<string, ContentQualityReport>();
  
  /**
   * Configure content approval workflow
   */
  setApprovalWorkflow(workflow: Partial<ContentApprovalWorkflow>): void {
    this.approvalWorkflow = {
      ...this.approvalWorkflow,
      ...workflow
    };
  }

  /**
   * Validate and process new medical content
   */
  async processNewContent(questionData: QuestionData): Promise<{
    success: boolean;
    questionId?: string;
    validationResult: ValidationResult;
    status: 'approved' | 'needs_review' | 'rejected';
    message: string;
  }> {
    try {
      // Step 1: Validate content quality
      const validationResult = await medicalContentValidator.validateQuestion(questionData);
      
      // Step 2: Determine approval status
      const status = this.determineApprovalStatus(validationResult);
      
      // Step 3: If approved or needs review, create the question
      let questionId: string | undefined;
      let success = false;
      
      if (status === 'approved') {
        const createdQuestion = await quizService.createQuestion(questionData);
        questionId = createdQuestion.id;
        success = true;
        
        // Log approval
        this.contentReports.set(questionId, {
          questionId,
          status: 'approved',
          validationResult,
          reviewDate: new Date(),
          reviewerNotes: 'Auto-approved based on validation score'
        });
      } else if (status === 'needs_review') {
        const createdQuestion = await quizService.createQuestion(questionData);
        questionId = createdQuestion.id;
        success = true;
        
        // Mark for manual review
        this.contentReports.set(questionId, {
          questionId,
          status: 'needs_review',
          validationResult,
          reviewDate: new Date(),
          reviewerNotes: 'Requires medical professional review'
        });
      }

      return {
        success,
        questionId,
        validationResult,
        status,
        message: this.generateProcessingMessage(status, validationResult)
      };

    } catch (error) {
      console.error('Error processing medical content:', error);
      throw new Error('Failed to process medical content');
    }
  }

  /**
   * Batch process multiple questions with quality control
   */
  async processBatchContent(questionsData: QuestionData[]): Promise<{
    totalProcessed: number;
    approved: number;
    needsReview: number;
    rejected: number;
    validationResults: ValidationResult[];
    detailedResults: Array<{
      questionData: QuestionData;
      result: Awaited<ReturnType<typeof this.processNewContent>>;
    }>;
  }> {
    const detailedResults = [];
    let approved = 0, needsReview = 0, rejected = 0;
    const validationResults: ValidationResult[] = [];

    for (const questionData of questionsData) {
      try {
        const result = await this.processNewContent(questionData);
        detailedResults.push({ questionData, result });
        validationResults.push(result.validationResult);

        switch (result.status) {
          case 'approved':
            approved++;
            break;
          case 'needs_review':
            needsReview++;
            break;
          case 'rejected':
            rejected++;
            break;
        }
      } catch (error) {
        console.error('Error processing question:', error);
        rejected++;
      }
    }

    return {
      totalProcessed: questionsData.length,
      approved,
      needsReview,
      rejected,
      validationResults,
      detailedResults
    };
  }

  /**
   * Review and update content status
   */
  async reviewContent(
    questionId: string, 
    status: 'approved' | 'rejected', 
    reviewerNotes: string
  ): Promise<boolean> {
    try {
      const existingReport = this.contentReports.get(questionId);
      if (!existingReport) {
        throw new Error('Content report not found');
      }

      // Update the report
      this.contentReports.set(questionId, {
        ...existingReport,
        status,
        reviewDate: new Date(),
        reviewerNotes
      });

      // If rejected, we might want to remove from active questions
      // This would depend on your specific business logic
      
      return true;
    } catch (error) {
      console.error('Error reviewing content:', error);
      return false;
    }
  }

  /**
   * Get content quality metrics and analytics
   */
  async getContentMetrics(): Promise<MedicalContentMetrics> {
    try {
      // Get all questions to analyze
      const questions = await quizService.getQuestions({ limit: 1000 });
      const reports = Array.from(this.contentReports.values());

      // Basic counts
      const totalQuestions = questions.length;
      const approvedQuestions = reports.filter(r => r.status === 'approved').length;
      const averageQualityScore = reports.length > 0 
        ? Math.round(reports.reduce((sum, r) => sum + r.validationResult.score, 0) / reports.length)
        : 0;

      // Category distribution
      const categoryDistribution: Record<string, number> = {};
      questions.forEach(q => {
        categoryDistribution[q.category] = (categoryDistribution[q.category] || 0) + 1;
      });

      // Difficulty distribution
      const difficultyDistribution: Record<string, number> = {};
      questions.forEach(q => {
        difficultyDistribution[q.difficulty] = (difficultyDistribution[q.difficulty] || 0) + 1;
      });

      // Common validation issues
      const issueCount = new Map<string, number>();
      reports.forEach(report => {
        report.validationResult.errors.forEach(error => {
          issueCount.set(error.code, (issueCount.get(error.code) || 0) + 1);
        });
        report.validationResult.warnings.forEach(warning => {
          issueCount.set(warning.code, (issueCount.get(warning.code) || 0) + 1);
        });
      });

      const commonValidationIssues = Array.from(issueCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([code]) => code);

      // Trends (simplified - would be more sophisticated in production)
      const medicalAccuracyTrend = reports
        .slice(-10)
        .map(r => r.validationResult.medicalAccuracyScore);
      
      const educationalValueTrend = reports
        .slice(-10)
        .map(r => r.validationResult.educationalValueScore);

      return {
        totalQuestions,
        approvedQuestions,
        averageQualityScore,
        categoryDistribution,
        difficultyDistribution,
        commonValidationIssues,
        medicalAccuracyTrend,
        educationalValueTrend
      };
    } catch (error) {
      console.error('Error getting content metrics:', error);
      throw new Error('Failed to retrieve content metrics');
    }
  }

  /**
   * Get validation report for specific question
   */
  getQuestionReport(questionId: string): ContentQualityReport | null {
    return this.contentReports.get(questionId) || null;
  }

  /**
   * Get all questions needing review
   */
  getQuestionsNeedingReview(): ContentQualityReport[] {
    return Array.from(this.contentReports.values())
      .filter(report => report.status === 'needs_review');
  }

  /**
   * Validate existing questions in database
   */
  async auditExistingContent(): Promise<{
    totalAudited: number;
    validationResults: ValidationResult[];
    qualityReport: {
      highQuality: number;      // Score 85+
      goodQuality: number;      // Score 70-84
      needsImprovement: number; // Score 50-69
      poorQuality: number;      // Score <50
    };
    recommendations: string[];
  }> {
    try {
      const questions = await quizService.getQuestions({ limit: 1000 });
      const validationResults: ValidationResult[] = [];
      
      for (const question of questions) {
        // Convert Question to QuestionData format for validation
        const questionData: QuestionData = {
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          category: question.category,
          difficulty: question.difficulty,
          usmleCategory: question.usmleCategory,
          tags: question.tags,
          medicalReferences: question.medicalReferences,
          // Default values for missing fields
          subject: 'Internal Medicine',
          system: 'Multiple Systems',
          topics: question.tags.slice(0, 3),
          points: question.difficulty === 'easy' ? 10 : question.difficulty === 'medium' ? 15 : 25
        };

        const validationResult = await medicalContentValidator.validateQuestion(questionData);
        validationResults.push(validationResult);

        // Store the report
        this.contentReports.set(question.id, {
          questionId: question.id,
          status: this.determineApprovalStatus(validationResult),
          validationResult,
          reviewDate: new Date(),
          reviewerNotes: 'Automated audit of existing content'
        });
      }

      // Quality analysis
      const qualityReport = {
        highQuality: validationResults.filter(r => r.score >= 85).length,
        goodQuality: validationResults.filter(r => r.score >= 70 && r.score < 85).length,
        needsImprovement: validationResults.filter(r => r.score >= 50 && r.score < 70).length,
        poorQuality: validationResults.filter(r => r.score < 50).length
      };

      // Generate recommendations
      const recommendations = this.generateAuditRecommendations(validationResults);

      return {
        totalAudited: questions.length,
        validationResults,
        qualityReport,
        recommendations
      };
    } catch (error) {
      console.error('Error auditing existing content:', error);
      throw new Error('Failed to audit existing content');
    }
  }

  /**
   * Determine approval status based on validation results
   */
  private determineApprovalStatus(validationResult: ValidationResult): 'approved' | 'needs_review' | 'rejected' {
    // Check for critical errors
    const hasCriticalErrors = validationResult.errors.some(e => e.severity === 'critical');
    if (hasCriticalErrors && this.approvalWorkflow.blockCriticalErrors) {
      return 'rejected';
    }

    // Check minimum score
    if (validationResult.score < this.approvalWorkflow.minimumScore) {
      return this.approvalWorkflow.requireMedicalReview ? 'needs_review' : 'rejected';
    }

    // Auto-approve if enabled
    if (this.approvalWorkflow.autoApprove && validationResult.score >= 85) {
      return 'approved';
    }

    // Default to review
    return this.approvalWorkflow.requireMedicalReview ? 'needs_review' : 'approved';
  }

  /**
   * Generate processing message based on status and validation
   */
  private generateProcessingMessage(status: string, validationResult: ValidationResult): string {
    switch (status) {
      case 'approved':
        return `Question approved with quality score ${validationResult.score}/100. Medical accuracy: ${validationResult.medicalAccuracyScore}%, Educational value: ${validationResult.educationalValueScore}%, USMLE compliance: ${validationResult.usmleComplianceScore}%.`;
      
      case 'needs_review':
        const majorIssues = validationResult.errors.filter(e => e.severity === 'major' || e.severity === 'critical').length;
        return `Question requires medical review. Quality score: ${validationResult.score}/100. Found ${majorIssues} major issues that need expert attention.`;
      
      case 'rejected':
        const criticalIssues = validationResult.errors.filter(e => e.severity === 'critical').length;
        return `Question rejected due to quality concerns. Quality score: ${validationResult.score}/100. Found ${criticalIssues} critical errors that must be resolved.`;
      
      default:
        return 'Processing completed.';
    }
  }

  /**
   * Generate audit recommendations based on validation results
   */
  private generateAuditRecommendations(validationResults: ValidationResult[]): string[] {
    const recommendations = [];
    const allErrors = validationResults.flatMap(r => r.errors);
    const allWarnings = validationResults.flatMap(r => r.warnings);

    // Analyze common issues
    const errorCounts = new Map<string, number>();
    allErrors.forEach(error => {
      errorCounts.set(error.code, (errorCounts.get(error.code) || 0) + 1);
    });

    const warningCounts = new Map<string, number>();
    allWarnings.forEach(warning => {
      warningCounts.set(warning.code, (warningCounts.get(warning.code) || 0) + 1);
    });

    // Generate specific recommendations
    if (errorCounts.get('INSUFFICIENT_EXPLANATION') || 0 > 5) {
      recommendations.push('Review and expand question explanations - many are too brief (<100 characters)');
    }

    if (warningCounts.get('NO_REFERENCES') || 0 > 10) {
      recommendations.push('Add medical references to questions for verification and authority');
    }

    if (errorCounts.get('INVALID_USMLE_CATEGORY') || 0 > 3) {
      recommendations.push('Standardize USMLE category classifications across all questions');
    }

    if (warningCounts.get('UNDEFINED_ABBREVIATION') || 0 > 8) {
      recommendations.push('Define medical abbreviations on first use for better educational value');
    }

    // General quality recommendations
    const averageScore = validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length;
    if (averageScore < 75) {
      recommendations.push(`Overall content quality needs improvement (current average: ${Math.round(averageScore)}/100)`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Content quality is excellent! Continue maintaining high standards.');
    }

    return recommendations;
  }
}

// Export singleton instance
export const medicalContentManager = new MedicalContentManager();