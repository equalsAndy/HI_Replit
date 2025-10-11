-- Create table for persistent Talia persona configurations
-- This allows admin changes to persona settings to persist through server restarts

CREATE TABLE IF NOT EXISTS talia_personas (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    data_access TEXT[] NOT NULL DEFAULT '{}',
    training_documents TEXT[] NOT NULL DEFAULT '{}',
    token_limit INTEGER NOT NULL DEFAULT 800,
    behavior_tone VARCHAR(200) NOT NULL DEFAULT 'encouraging, conversational',
    behavior_name_usage VARCHAR(20) NOT NULL DEFAULT 'first' CHECK (behavior_name_usage IN ('first', 'full', 'formal')),
    behavior_max_response_length INTEGER NOT NULL DEFAULT 400,
    behavior_help_style VARCHAR(20) NOT NULL DEFAULT 'guide' CHECK (behavior_help_style IN ('guide', 'write', 'analyze')),
    enabled BOOLEAN NOT NULL DEFAULT true,
    environments TEXT[] NOT NULL DEFAULT '{"development", "staging", "production"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_talia_personas_enabled ON talia_personas(enabled);
CREATE INDEX IF NOT EXISTS idx_talia_personas_updated_at ON talia_personas(updated_at);

-- Insert default persona configurations
INSERT INTO talia_personas (
    id, name, role, description, data_access, training_documents, token_limit,
    behavior_tone, behavior_name_usage, behavior_max_response_length, behavior_help_style,
    enabled, environments
) VALUES 
(
    'ast_reflection',
    'Reflection Talia',
    'Step-by-step reflection coaching',
    'Helps users think through their strength reflections during workshop steps',
    ARRAY['basic_user_info', 'current_step_progress', 'current_strengths_focus', 'job_title_context'],
    ARRAY['d359217d-2020-44e2-8f42-25cfe01e3a2b'],
    800,
    'encouraging, conversational, coach-like',
    'first',
    400,
    'guide',
    true,
    ARRAY['development', 'staging']
),
(
    'star_report',
    'Star Report Talia',
    'Comprehensive report generation',
    'Creates detailed personal and professional development reports',
    ARRAY['full_assessment_data', 'all_reflections', 'complete_journey', 'professional_context'],
    ARRAY[
        '0a6f331e-bb58-469c-8aa0-3b5db2074f1b',
        '8053a205-701b-4a10-8dd8-39d92b18566d',
        '3577e1e1-2fad-45d9-8ad1-12698bc327e3',
        '158fcf64-75e9-4f46-8331-7de774ca89a6',
        '1ffd5369-e17a-41bb-b54c-2f38630d7ff4',
        '6e98d248-db4c-4bdc-99e0-a90e25b7032c',
        '5cd8779c-4a3f-4e8a-91a7-378323ce8493',
        'ddb2e849-0ff1-4766-9675-288575b95806',
        '7a1ccb9d-31f7-4d9b-88f4-d63f3e9b50bb',
        'a2eb129f-faa9-418b-96fb-0beda55a4eb5',
        '30bf8cb3-3411-490f-a024-c11e20728691',
        '74faa6cb-91a3-41e8-a99d-96c1d4036e13',
        'f2cf6ca4-8954-42dd-978e-42b1c4ce6fe2',
        '24454ad2-0655-4e5e-b048-3496e1c85bce',
        '37ffd442-c115-4291-b1e9-38993089e285',
        '2fe879b8-6e00-40a1-a83a-2499da4803e3',
        '7f16c08e-45c4-4847-9992-ec1445ea7605',
        '55a07f54-4fc3-4297-b5eb-5a41517ea7f7',
        'fed2182e-4387-4d0d-a269-7e7534df7020',
        '0535a97a-4353-4cf3-822a-36b97f12c7c0',
        'a89f9f77-ecd4-4365-9adf-75fac4154528',
        '0dcfa7e0-a08d-45be-a299-4ca33efef3f1',
        '9f73a4ee-7a69-490c-a530-59597825b58f',
        '8498619b-8e07-4f62-8bce-c075e17adc1b',
        'd74c99c0-12c5-4d15-9a34-d11a6394fb75',
        '0c360d21-7da8-4299-8443-6b27e43ebfdb'
    ],
    4000,
    'comprehensive, analytical, developmental',
    'full',
    15000,
    'analyze',
    true,
    ARRAY['development', 'staging']
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    description = EXCLUDED.description,
    data_access = EXCLUDED.data_access,
    training_documents = EXCLUDED.training_documents,
    token_limit = EXCLUDED.token_limit,
    behavior_tone = EXCLUDED.behavior_tone,
    behavior_name_usage = EXCLUDED.behavior_name_usage,
    behavior_max_response_length = EXCLUDED.behavior_max_response_length,
    behavior_help_style = EXCLUDED.behavior_help_style,
    enabled = EXCLUDED.enabled,
    environments = EXCLUDED.environments,
    updated_at = NOW();

COMMENT ON TABLE talia_personas IS 'Stores persistent configuration for Talia AI personas, allowing admin changes to survive server restarts';
COMMENT ON COLUMN talia_personas.training_documents IS 'Array of training document UUIDs that this persona has access to';
COMMENT ON COLUMN talia_personas.data_access IS 'Array of data access permissions for this persona';
COMMENT ON COLUMN talia_personas.environments IS 'Array of environments where this persona is active';