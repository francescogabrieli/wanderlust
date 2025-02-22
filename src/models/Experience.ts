export class Experience {
    static readonly BASE_EXP_PER_LEVEL = 200;
    static readonly EXP_PER_COMPLETED_SESSION = 250;
    static readonly EXP_PER_LANDMARK = 50;
    static readonly EXP_PER_LANDMARK_CREATED = 200; // New constant for landmark creation

    constructor(
        public currentExp: number = 0,
        public currentLevel: number = 1
    ) {}

    static calculateRequiredExp(level: number): number {
        return this.BASE_EXP_PER_LEVEL * level;
    }

    addExperience(exp: number): { 
        newLevel: number, 
        newExp: number, 
        didLevelUp: boolean,
        progressToNextLevel: number 
    } {
        const oldLevel = this.currentLevel;
        this.currentExp += exp;
        
        // Check if we should level up
        while (this.currentExp >= Experience.calculateRequiredExp(this.currentLevel)) {
            this.currentExp -= Experience.calculateRequiredExp(this.currentLevel);
            this.currentLevel++;
        }

        // Calculate progress to next level (0 to 1)
        const requiredExp = Experience.calculateRequiredExp(this.currentLevel);
        const progressToNextLevel = this.currentExp / requiredExp;

        return {
            newLevel: this.currentLevel,
            newExp: this.currentExp,
            didLevelUp: this.currentLevel > oldLevel,
            progressToNextLevel
        };
    }

    // Add method to create Experience from stored data
    static fromStorage(data: { currentExp: number; currentLevel: number }): Experience {
        return new Experience(data.currentExp, data.currentLevel);
    }

    // Add method to prepare for storage
    toStorage(): { currentExp: number; currentLevel: number } {
        return {
            currentExp: this.currentExp,
            currentLevel: this.currentLevel
        };
    }
}
