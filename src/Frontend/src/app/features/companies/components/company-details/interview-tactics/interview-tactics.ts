import { Component, ChangeDetectionStrategy, signal, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideTarget, lucideLightbulb, lucideMessageSquare, lucideX, lucideChevronRight, lucideQuote, lucideFileText } from '@ng-icons/lucide';

@Component({
  selector: 'app-interview-tactics',
  standalone: true,
  imports: [CommonModule, NgIcon, A11yModule],
  providers: [provideIcons({ lucideSparkles, lucideTarget, lucideLightbulb, lucideMessageSquare, lucideX, lucideChevronRight, lucideQuote, lucideFileText })],
  templateUrl: './interview-tactics.html',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class InterviewTacticsComponent implements OnDestroy {
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.selectedTactic()) {
      this.closeDrawer();
    }
  }
  selectedTactic = signal<Tactic | null>(null);
  displayedReasoning = signal('');
  private typeInterval: number | undefined;

  tactics: Tactic[] = [
    {
      id: 'culture',
      type: 'Culture Strategy',
      icon: 'lucideLightbulb',
      title: 'Mention their recent sustainability report and how it aligns with your passion for green tech.',
      reasoning: 'Companies with recent green initiatives are currently prioritizing long-term thinkers over short-term fixers. This signals you are looking for a career, not a gig.',
      phrases: [
        '"I was really impressed by the Q3 sustainability goals..."',
        '"How do you see the engineering team contributing to the net-zero target?"',
        '"My values align heavily with the mission statement on page 4..."'
      ],
      cvAlignment: 'Volunteer work at GreenTech NGO (2021)',
      colorClass: 'bg-muted border-border'
    },
    {
      id: 'tech',
      type: 'Technical Objective',
      icon: 'lucideTarget',
      title: 'Double down on your Kubernetes autoscaling experience; they\'re currently optimizing infrastructure.',
      reasoning: 'Their engineering blog mentions 3 outages in the last month due to scaling issues. They are desperate for stability.',
      phrases: [
        '"In my last role, I reduced 502 errors by 40% using HPA..."',
        '"I noticed you use AWS EKS, have you considered spot instances for cost?"',
        '"I love debugging race conditions in distributed systems."'
      ],
      cvAlignment: 'Implemented K8s HPA at StartupX',
      colorClass: 'bg-primary/10 border-primary/20 text-primary'
    },
    {
      id: 'query',
      type: 'S-Tier Query',
      icon: 'lucideMessageSquare',
      title: '"How does the team balance rapid delivery with the technical debt inherently created by scaling?"',
      reasoning: 'This question shows you understand the trade-offs of their current growth phase. It frames you as a pragmatic senior engineer.',
      phrases: [
        '"How do you decide when to refactor vs ship?"',
        '"What is the process for paying down tech debt here?"',
        '"Do you have dedicated cooldown sprints?"'
      ],
      cvAlignment: 'Refactored Legacy Auth System (2023)',
      colorClass: 'bg-muted border-border'
    }
  ];

  openDrawer(tactic: Tactic) {
    this.selectedTactic.set(tactic);
    this.startTypewriter(tactic.reasoning);
  }

  closeDrawer() {
    this.selectedTactic.set(null);
    clearInterval(this.typeInterval);
    this.displayedReasoning.set('');
  }

  private startTypewriter(text: string) {
    this.displayedReasoning.set('');
    let i = 0;
    clearInterval(this.typeInterval);

    this.typeInterval = setInterval(() => {
      if (i < text.length) {
        this.displayedReasoning.update(current => current + text.charAt(i));
        i++;
      } else {
        clearInterval(this.typeInterval);
      }
    }, 25);
  }

  ngOnDestroy(): void {
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
    }
  }
}

interface Tactic {
  id: string;
  type: string;
  icon: string;
  title: string;
  reasoning: string;
  phrases: string[];
  cvAlignment: string;
  colorClass: string;
}
