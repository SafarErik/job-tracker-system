export interface SkillDto {
    id: string;
    name: string;
    category?: string;
}

export interface CreateSkillDto {
    name: string;
    category?: string;
}
