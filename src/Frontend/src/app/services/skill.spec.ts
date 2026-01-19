import { Skill } from '../models/skill.model';

describe('Skill', () => {
  let skill: Skill;

  beforeEach(() => {
    // Initialize a new Skill instance directly
    skill = {} as Skill;
  });

  it('should be created', () => {
    expect(skill).toBeTruthy();
  });
});
