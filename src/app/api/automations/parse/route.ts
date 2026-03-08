import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callAI } from '@/lib/ai/router';
import { checkRateLimit, ApiError, validateString, safeJsonParse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return ApiError.unauthorized();

  const allowed = await checkRateLimit(`parse:${user.id}`);
  if (!allowed) return ApiError.tooManyRequests();

  const body = await request.json();
  const { description } = body;

  if (!validateString(description, 1000)) {
    return ApiError.badRequest('자동화 설명을 입력해주세요 (최대 1000자)');
  }

  const response = await callAI({
    task: 'workflow_parse',
    userId: user.id,
    input: description,
    systemPrompt: `당신은 워크플로우 자동화 파서입니다. 사용자의 자연어 설명을 분석하여 다음 JSON 형식으로만 응답하세요:

{
  "name": "자동화 이름 (간결하게)",
  "trigger": "트리거 ID (new_email|schedule|slack_message|webhook|manual|sheets_row_added 중 하나)",
  "actions": ["액션 ID 배열 (send_email|slack_message|create_jira_issue|create_notion_page|ai_summarize|webhook_call|add_sheets_row 중 복수 가능)"]
}

예시:
- "매일 아침 9시에 이메일 요약" → trigger: "schedule", actions: ["ai_summarize", "slack_message"]
- "긴급 이메일 받으면 Slack DM" → trigger: "new_email", actions: ["slack_message"]`,
    options: { maxTokens: 300 },
  });

  const parsed = safeJsonParse(response.content, { error: 'parse_failed' });
  if ('error' in parsed) {
    return NextResponse.json({ error: 'parse_failed' }, { status: 500 });
  }
  return NextResponse.json(parsed);
}
