import {
	Injectable,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common'
import { PrismaService } from '../../../prisma/prisma.service'
import { WorkflowRule } from '@prisma/client'
import {
	CreateWorkflowRuleDto,
	UpdateWorkflowRuleDto,
} from './dto/workflow-rule.dto'

export interface RuleConditionContext {
	caseId: string
	priority?: string
	status?: string
	assignedToId?: string | null
	violationTypeCount?: number
	metadata?: Record<string, any>
}

export interface RuleExecutionResult {
	rule: WorkflowRule
	matched: boolean
	error?: string
}

@Injectable()
export class WorkflowRulesService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Get all rules for a specific type, optionally filtered by game
	 */
	async getRules(ruleType: string, gameId?: string): Promise<WorkflowRule[]> {
		return this.prisma.workflowRule.findMany({
			where: {
				ruleType,
				enabled: true,
				...(gameId && { gameId }),
			},
			orderBy: { priority: 'desc' },
		})
	}

	/**
	 * Evaluate whether a single rule's conditions match the current context
	 */
	async evaluateRule(
		rule: WorkflowRule,
		context: RuleConditionContext,
	): Promise<boolean> {
		try {
			if (!rule.enabled) return false

			const conditions = rule.conditions as Record<string, any>
			if (!conditions || Object.keys(conditions).length === 0) return false

			// Simple condition matching logic
			for (const [key, expectedValue] of Object.entries(conditions)) {
				const contextValue = context[key as keyof RuleConditionContext]

				// Handle operators (e.g., { "$gte": 3 })
				if (typeof expectedValue === 'object' && expectedValue !== null) {
					if (!this.evaluateOperator(contextValue, expectedValue)) {
						return false
					}
				} else {
					// Exact match
					if (contextValue !== expectedValue) {
						return false
					}
				}
			}

			return true
		} catch (error) {
			console.error(`Error evaluating rule ${rule.id}:`, error)
			return false
		}
	}

	/**
	 * Execute operator-based comparisons
	 */
	private evaluateOperator(value: any, operator: Record<string, any>): boolean {
		if ('$gte' in operator) return value >= operator['$gte']
		if ('$lte' in operator) return value <= operator['$lte']
		if ('$gt' in operator) return value > operator['$gt']
		if ('$lt' in operator) return value < operator['$lt']
		if ('$eq' in operator) return value === operator['$eq']
		if ('$ne' in operator) return value !== operator['$ne']
		if ('$in' in operator) return (operator['$in'] as any[]).includes(value)
		if ('$nin' in operator) return !(operator['$nin'] as any[]).includes(value)
		return false
	}

	/**
	 * Execute all enabled rules of a specific type and return results
	 */
	async executeRules(
		ruleType: string,
		context: RuleConditionContext,
		gameId?: string,
	): Promise<RuleExecutionResult[]> {
		const rules = await this.getRules(ruleType, gameId)
		const results: RuleExecutionResult[] = []

		for (const rule of rules) {
			const matched = await this.evaluateRule(rule, context)
			results.push({
				rule,
				matched,
			})
		}

		return results
	}

	/**
	 * Create a new workflow rule
	 */
	async createRule(data: CreateWorkflowRuleDto): Promise<WorkflowRule> {
		try {
			return await this.prisma.workflowRule.create({
				data: {
					name: data.name,
					description: data.description,
					ruleType: data.ruleType,
					conditions: data.conditions as any,
					actions: data.actions as any,
					gameId: data.gameId,
					enabled: data.enabled ?? true,
					priority: data.priority ?? 0,
				},
			})
		} catch (error) {
			throw new BadRequestException(`Failed to create rule: ${error}`)
		}
	}

	/**
	 * Update an existing workflow rule
	 */
	async updateRule(
		id: string,
		data: UpdateWorkflowRuleDto,
	): Promise<WorkflowRule> {
		try {
			return await this.prisma.workflowRule.update({
				where: { id },
				data: {
					...(data.name && { name: data.name }),
					...(data.description !== undefined && {
						description: data.description,
					}),
					...(data.ruleType && { ruleType: data.ruleType }),
					...(data.conditions && { conditions: data.conditions as any }),
					...(data.actions && { actions: data.actions as any }),
					...(data.enabled !== undefined && { enabled: data.enabled }),
					...(data.priority !== undefined && { priority: data.priority }),
				},
			})
		} catch (error) {
			throw new BadRequestException(`Failed to update rule: ${error}`)
		}
	}

	/**
	 * Delete a workflow rule
	 */
	async deleteRule(id: string): Promise<void> {
		try {
			await this.prisma.workflowRule.delete({
				where: { id },
			})
		} catch (error) {
			throw new BadRequestException(`Failed to delete rule: ${error}`)
		}
	}

	/**
	 * Get all rules (admin only)
	 */
	async getAllRules(
		ruleType?: string,
		gameId?: string,
		enabled?: boolean,
	): Promise<WorkflowRule[]> {
		return this.prisma.workflowRule.findMany({
			where: {
				...(ruleType && { ruleType }),
				...(gameId && { gameId }),
				...(enabled !== undefined && { enabled }),
			},
			orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
		})
	}

	/**
	 * Get a single rule by ID
	 */
	async getRule(id: string): Promise<WorkflowRule | null> {
		return this.prisma.workflowRule.findUnique({
			where: { id },
		})
	}
}
