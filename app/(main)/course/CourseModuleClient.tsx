"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Circle, ChevronLeft, ChevronRight, X, Play, BookOpen, Menu } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from '@/app/hooks/useUser';
import { toast } from 'sonner';

import { Pause, Square } from "lucide-react";


import Image from "next/image";
import { useRef } from "react";

const STORAGE_KEY = "gut-course-progress-v";


    
 const courseData = {
  title: "Gut Health & Stress Resilience for Professionals",
  sections: [
    {
      id: "intro",
      title: "Introduction",
      modules: [
        {
          id: "welcome",
          title: "Welcome",
          contentBlocks: [
            {
              type: "text",
              content: "Welcome to Gut Health & Stress Resilience for Professionals! We're thrilled to have you join us in this vital exploration of gut health and stress management tailored specifically for corporate employees like you."
            },
            {
              type: "video",
              content: {
                videoUrl: "https://www.youtube.com/embed/UcDr9pQNNEM",
                title: "Introduction to Gut Health"
              }
            },
            {
              type: "heading",
              content: "Welcome",
              level: 1
            },
            {
              type: "image",
              content: {
                src: "./course.png",
                alt: "Course pathway diagram showing transformation from stressed professional to resilient professional",
                caption: "Your journey from stressed professional to resilient professional"
              }
            },
            {
              type: "heading",
              content: "What You Will Learn:",
              level: 2
            },
            {
              type: "list",
              content: {
                items: [
                  "<strong>Understanding Gut Health:</strong> You'll grasp what gut health is, its importance for daily performance, and the key components that support a functioning digestive system.",
                  "<strong>The Gut-Brain Connection:</strong> Explore how the health of your gut directly influences your mental clarity, mood, and cognitive performance.",
                  "<strong>Impact of Modern Lifestyles:</strong> Recognize how workplace habits and stress can affect digestion and overall gut health.",
                  "<strong>Debunking Myths:</strong> Identify common myths surrounding gut health versus evidence-based facts.",
                  "<strong>Microhabits for Wellness:</strong> Learn simple, realistic microhabits that can significantly improve your gut health and overall well-being.",
                  "<strong>Stress Management Techniques:</strong> Integrate effective strategies to manage stress, which can further enhance your gut health."
                ]
              }
            },
            {
              type: "heading",
              content: "Course Navigation:",
              level: 3
            },
            {
              type: "text",
              content: "To navigate through the course, you can click the left and right arrows in the top right corner of the screen or use the menu on the left side for easy access to different sections."
            },
            {
              type: "heading",
              content: "Assessments:",
              level: 3
            },
            {
              type: "text",
              content: "This course includes quizzes and assignments designed to solidify your understanding:"
            },
            {
              type: "list",
              content: {
                items: [
                  "<strong>Quiz Pass Grade: 80%</strong>"
                ]
              }
            },
            {
              type: "text",
              content: "We encourage you to enjoy your learning experience, engage with the materials, and take practical steps towards improving your gut health and managing stress more effectively. Welcome aboard, and let's get started!"
            }
          ]
        }
      ]
    },
    {
      id: "gut-health",
      title: "Understanding Gut Health",
      modules: [
       {
  id: "intro-gut",
  title: "Introduction to Gut Health",
  contentBlocks: [
    {
      type: "video",
      content: {
        videoUrl: "https://www.youtube.com/embed/0ZFDZjhKn3w",
        title: "What is Gut Health and Why It Matters?"
      }
    },

    {
      type: "heading",
      content: "Understanding Gut Health",
      level: 1
    },

    {
      type: "text",
      content:
        "Gut health refers to the overall well-being of your digestive system, playing a crucial role in both physical and mental health. It encompasses the balance of beneficial microorganisms, known as the gut microbiota, that reside in your intestines. A healthy gut functions efficiently by digesting food, absorbing nutrients, and protecting against harmful bacteria."
    },

    {
      type: "image",
      content: {
        src: "./course2.png",
        alt: "Diagram showing gut ecosystem, gut-brain connection, and health impact",
        caption: "The gut ecosystem, gut–brain connection, and its impact on overall health"
      }
    },

    {
      type: "heading",
      content: "Key Components of Gut Health",
      level: 2
    },

    {
      type: "list",
      content: {
        items: [
          "<strong>Microbiota Diversity:</strong> A diverse gut microbiome is essential for optimal digestive function. It supports immune response, aids digestion, and protects against illnesses by breaking down complex foods and improving nutrient absorption.",
          "<strong>Gut Barrier Function:</strong> The gut wall acts as a protective barrier, preventing harmful substances and pathogens from entering the bloodstream. When compromised (often called a 'leaky gut'), it can lead to inflammation and various health issues.",
          "<strong>Digestive Enzymes:</strong> These enzymes help break down food into usable nutrients. A healthy gut produces enzymes efficiently, ensuring your body absorbs essential vitamins and minerals."
        ]
      }
    },

    {
      type: "text",
      content:
        "Awareness of these elements emphasizes that gut health is not just about digestion. It plays a vital role in maintaining energy levels, emotional balance, immunity, and stress resilience. By understanding how these components interact, you can take proactive steps toward improving your gut health and overall well-being."
    }
  ]
},

{
  id: "digestion-basics",
  title: "Basics of digestion",
  contentBlocks: [
    {
      type: "video",
      content: {
        videoUrl: "https://www.youtube.com/embed/xFsJu8SzoEs",
        title: "Basics of digestion"
      }
    },

    {
      type: "heading",
      content: "Basics of Digestion — What Every Corporate Professional Should Know",
      level: 1
    },

    {
      type: "text",
      content:
        "Digestion is not just a stomach-only event.<br/><br/>It begins the moment you see, smell, or even think about food. That anticipatory phase — called the cephalic phase — activates digestive enzymes, stomach acid, and gut motility in preparation for nutrients. For busy professionals, rushed lunches, eating at a screen, or skipping meals blunt this anticipatory response and reduce digestive efficiency."
    },

    {
      type: "heading",
      content: "Stress plays a central role in disrupting digestion",
      level: 2
    },

    {
      type: "text",
      content:
        "When you’re under chronic work pressure, the body shifts into a sympathetic “fight-or-flight” state. Blood flow to the gut is reduced, stomach acid and enzyme production can become irregular, motility may speed up (leading to diarrhea) or slow down (leading to constipation), and the tightly regulated barrier function of the gut lining can weaken."
    },

    {
      type: "text",
      content:
        "Over time, a dysregulated autonomic nervous system — where the balance between sympathetic and parasympathetic activity is off — impairs nutrient breakdown, absorption, and immune signaling from the gut to the rest of the body."
    },

    {
      type: "text",
      content:
        "One downstream consequence of these disruptions is <strong>dysbiosis</strong>: an imbalance in the gut microbial community."
    },

    {
      type: "text",
      content:
        "Dysbiosis is now recognized as a driving force behind many modern lifestyle-related conditions, including obesity, metabolic syndrome, chronic fatigue, mood disorders, skin problems, and low-grade systemic inflammation. In other words, when the nervous system and digestion are out of sync, gut microbes also shift in composition and function, which can amplify symptoms and make recovery harder."
    },

    {
      type: "text",
      content:
        "Modern work life magnifies these risks. Fast-paced schedules, frequent reliance on ultra-processed foods (UPFs), irregular eating windows, long periods of sedentary behavior, and low dietary fiber intake all combine to harm gut health. Ultra-processed foods are typically low in fermentable substrates that beneficial bacteria need and high in additives, sugar, and unhealthy fats that promote inflammation. This pattern has been linked with higher rates of chronic disease and increased mortality in large population studies."
    },

    {
      type: "heading",
      content: "Fiber is a surprisingly simple and powerful protective factor",
      level: 2
    },

    {
      type: "text",
      content:
        "Soluble and insoluble fibers feed beneficial bacteria, support regular bowel movements, and help maintain the integrity of the gut lining. For adults, aiming for about 25–30 grams of fiber per day from whole-food sources — fruits, vegetables, legumes, whole grains, nuts, and seeds — is a practical target."
    },

    {
      type: "text",
      content:
        "Evidence suggests that adequate fiber intake is associated with substantial reductions in risk for gastrointestinal cancers. Multiple studies indicate that consuming recommended amounts of fiber can lower the risk of stomach and colon cancer by a large margin, with some analyses showing reductions on the order of 40% compared with low-fiber diets."
    },

    {
      type: "heading",
      content: "Practical steps for corporate professionals",
      level: 2
    },

    {
      type: "list",
      content: {
        items: [
          "Start meals mindfully: pause for 60–90 seconds before eating to engage the parasympathetic system.",
          "Choose whole foods over ultra-processed foods (UPFs) whenever possible, even during busy workdays.",
          "Aim for 25–30 g of fiber daily through varied plant foods to support microbiome diversity and long-term digestive health.",
          "Build stress-resilience practices into the workday: short breathing breaks, movement, and regular meal timing help restore digestive function."
        ]
      }
    },

    {
      type: "image",
      content: {
        src: "./course3.png",
        alt: "Diagram showing digestion process from ingestion to elimination",
        caption: "Overview of digestion: ingestion, mechanical breakdown, chemical digestion, absorption, water reabsorption, and elimination"
      }
    },

    {
      type: "text",
      content:
        "By recognizing how stress, nervous system balance, diet quality, and fiber intake intersect, professionals can take concrete actions to protect digestion, support a healthy microbiome, and lower their long-term health risks."
    }
  ]
}

,
        {
  id: "microbiome",
  title: "Human Microbiome",
  contentBlocks: [
    {
      type: "video",
      content: {
        videoUrl: "https://www.youtube.com/embed/QcHWNBT6Lw8",
        title: "Human Microbiome"
      }
    },

    {
      type: "heading",
      content: "The Human Microbiome: The Body’s Invisible Workforce",
      level: 1
    },

    {
      type: "heading",
      content: "What Is the Human Microbiome?",
      level: 2
    },

    {
      type: "text",
      content:
        "The human microbiome refers to the trillions of microorganisms—bacteria, viruses, fungi, and other microbes—that live in and on the body. The largest and most influential population resides in the gut, particularly the large intestine. These microbes are not harmful invaders; they function as an internal ecosystem that supports digestion, immunity, metabolism, and even brain health."
    },

    {
      type: "heading",
      content: "Why the Microbiome Matters for Everyday Health",
      level: 2
    },

    {
      type: "heading",
      content: "More Than Digestion",
      level: 3
    },

    {
      type: "text",
      content:
        "While the microbiome plays a critical role in breaking down food and absorbing nutrients, its influence extends far beyond digestion. Gut microbes help regulate inflammation, support immune defenses, produce essential vitamins, and influence hormones related to mood, energy, and stress resilience. Nearly 70 percent of the immune system is closely linked to gut-associated lymphoid tissue, making the microbiome central to immune health."
    },

    {
      type: "heading",
      content: "The Microbiome and the Gut–Brain Connection",
      level: 2
    },

    {
      type: "heading",
      content: "How Gut Bacteria Influence Mood and Focus",
      level: 3
    },

    {
      type: "text",
      content:
        "The gut and brain communicate constantly through the gut-brain axis, a network of nerves, hormones, and microbial signals. Gut bacteria produce neurotransmitters such as serotonin and gamma-aminobutyric acid (GABA), which influence mood, motivation, and emotional balance. When the microbiome is balanced, this communication supports mental clarity and stress regulation. When disrupted, it can contribute to anxiety, low mood, brain fog, and fatigue."
    },

    {
      type: "heading",
      content: "What Disrupts the Microbiome?",
      level: 2
    },

    {
      type: "heading",
      content: "Modern Lifestyle Pressures",
      level: 3
    },

    {
      type: "text",
      content:
        "Several common lifestyle factors can negatively affect microbiome balance, especially in working professionals. Chronic stress, irregular meals, poor sleep, excess caffeine, ultra-processed foods, frequent antibiotic use, and prolonged sitting all alter the gut environment. Over time, these factors reduce beneficial microbes and increase inflammatory species, weakening gut barrier integrity and overall resilience."
    },

    {
      type: "heading",
      content: "Supporting a Healthy Microbiome",
      level: 2
    },

    {
      type: "heading",
      content: "Small Daily Habits Make a Difference",
      level: 3
    },

    {
      type: "text",
      content:
        "A healthy microbiome thrives on consistency rather than extremes. Regular meals, diverse plant-based foods, adequate protein, proper hydration, quality sleep, and stress management practices all help maintain microbial balance. Mindful eating, movement breaks during the workday, and simple relaxation practices support both the gut and nervous system."
    },

    {
      type: "heading",
      content: "Key Takeaway",
      level: 2
    },

    {
      type: "text",
      content:
        "The human microbiome functions like an invisible workforce—quietly influencing digestion, immunity, mood, and long-term health. When supported through balanced habits and stress regulation, it enhances energy, focus, and resilience. Caring for the microbiome is not just a health strategy; it is an investment in sustainable performance and wellbeing."
    }
  ]
}
,
        {
  id: "myths-facts",
  title: "Myths vs. Facts",
  contentBlocks: [
    {
      type: "video",
      content: {
        videoUrl: "https://www.youtube.com/embed/T7y75_bf-Po",
        title: "Some common myths and facts around gut health"
      }
    },

    {
      type: "heading",
      content: "Myths vs. Facts",
      level: 1
    },

    {
      type: "text",
      content:
        "Many misconceptions surround gut health, which can cloud our understanding and lead to ineffective health practices. Separating fact from fiction is essential to enable a clearer perspective on what it truly means to maintain a healthy gut."
    },

    {
      type: "heading",
      content: "Myth 1: All Bacteria Are Bad",
      level: 3
    },

    {
      type: "text",
      content:
        "A common myth is that all bacteria are harmful. In reality, your gut is home to trillions of bacteria, most of which are beneficial. These good bacteria aid digestion, support the immune system, and produce important nutrients. Instead of fearing bacteria, it’s important to focus on nurturing a balanced microbiome to promote gut health."
    },

    {
      type: "heading",
      content: "Myth 2: Probiotics Alone Fix Digestive Issues",
      level: 3
    },

    {
      type: "text",
      content:
        "While probiotics can be beneficial, relying solely on them to fix digestive problems is misleading. They complement a healthy diet and lifestyle but cannot replace the need for a well-rounded approach. Factors such as diet, exercise, and stress management play significant roles in maintaining a healthy gut. Nourishing your gut requires a holistic strategy."
    },

    {
      type: "heading",
      content: "Myth 3: Fiber Is Optional",
      level: 3
    },

    {
      type: "text",
      content:
        "Another misconception is that fiber is merely an optional part of the diet. In fact, fiber plays a crucial role in digestive health by promoting regular bowel movements and feeding beneficial gut bacteria. A lack of fiber can lead to various digestive issues, including constipation. Prioritizing fiber intake is essential for keeping your gut functioning optimally."
    },

    {
      type: "heading",
      content: "Myth 4: It's Too Late to Improve Gut Health",
      level: 3
    },

    {
      type: "text",
      content:
        "Many people believe that once gut issues arise, it’s too late to make changes. This simply isn’t true. Your gut health can improve at any age with the right strategies in place. Simple dietary adjustments, stress reduction techniques, and consistent healthy habits can lead to significant improvements over time."
    },

    {
      type: "heading",
      content: "Myth 5: You Only Need to Worry About Gut Health When You're Sick",
      level: 3
    },

    {
      type: "text",
      content:
        "Lastly, some think that gut health is only a concern when symptoms appear. In fact, proactive management of gut health can prevent issues before they arise. Regular awareness and preventative measures can lead to sustained gut health and improve overall wellness, enhancing your quality of life in the workplace and beyond."
    },

    {
      type: "text",
      content:
        "By understanding and debunking these myths, you equip yourself with the knowledge necessary to make informed choices about your health, empowering your gut and, ultimately, your performance."
    }
  ]
}
,
        {
  id: "meditation-stress",
  title: "Impact of Meditation on Stress",
  contentBlocks: [
    {
      type: "video",
      content: {
        videoUrl: "https://www.youtube.com/embed/yz0m3-IRe44",
        title: "Stress and meditation"
      }
    },

    {
      type: "heading",
      content: "The Impact of Meditation on Stress, Gut Health, and Performance in Working Professionals",
      level: 1
    },

    {
      type: "heading",
      content: "Why Stress Management Is a Workplace Health Priority",
      level: 2
    },

    {
      type: "text",
      content:
        "Modern corporate environments demand sustained attention, rapid decision-making, and long hours of cognitive engagement. While stress is often viewed as a mental or emotional concern, its effects extend far beyond the mind. Chronic workplace stress directly impacts digestion, immunity, metabolic health, and long-term productivity. Understanding and addressing this connection is critical for sustainable employee wellbeing."
    },

    {
      type: "heading",
      content: "The Gut–Brain Axis: The Body’s Internal Communication System",
      level: 2
    },

    {
      type: "heading",
      content: "How Stress Signals Affect Digestion and Focus",
      level: 3
    },

    {
      type: "text",
      content:
        "Most professionals have experienced a nervous stomach before a presentation or digestive discomfort after a stressful day. These reactions are physiological, not psychological. The gut and brain are in constant communication through a network known as the gut-brain axis. This bidirectional system involves nerves, hormones, and gut microbes working together to regulate digestion, mood, and inflammation."
    },

    {
      type: "text",
      content:
        "At the center of this system is the vagus nerve, the longest cranial nerve in the body. Extending from the brainstem to the digestive tract, it acts as a primary communication channel between the nervous system and the gut. When the brain perceives stress, the body shifts into a sympathetic “fight-or-flight” state, reducing vagal activity. As a result, digestion slows, enzyme secretion decreases, and gut motility is suppressed."
    },

    {
      type: "text",
      content:
        "Over time, reduced vagal tone can impair gut barrier integrity and disrupt digestion, contributing to symptoms such as bloating, constipation, reflux, and fatigue. Nearly 90 percent of the body’s serotonin is produced in the gut, linking digestive health directly to mood, motivation, and emotional regulation."
    },

    {
      type: "heading",
      content: "How Workplace Stress Reshapes the Gut Microbiome",
      level: 2
    },

    {
      type: "heading",
      content: "Stress Hormones and Their Impact on Gut Balance",
      level: 3
    },

    {
      type: "text",
      content:
        "Chronic stress does not affect the nervous system alone—it actively alters the gut microbiome. Elevated levels of cortisol and adrenaline reduce blood flow to the intestines, lower mucus secretion, and increase immune activation within the gut. This creates an environment that is less supportive of beneficial bacteria."
    },

    {
      type: "text",
      content:
        "Scientific research shows that prolonged stress reduces populations of protective microbes such as Lactobacillus and Bifidobacterium, which play a key role in maintaining gut barrier integrity and reducing inflammation. At the same time, stress encourages the growth of inflammatory bacteria, increasing intestinal permeability. This allows bacterial toxins to enter the bloodstream, triggering immune responses and systemic inflammation."
    },

    {
      type: "text",
      content:
        "These inflammatory signals travel back to the brain through the bloodstream and the vagus nerve, further impairing stress regulation and emotional balance—creating a cycle where stress and gut dysfunction reinforce each other."
    },

    {
      type: "heading",
      content: "The Stress–Gut Feedback Loop in Corporate Employees",
      level: 2
    },

    {
      type: "heading",
      content: "Why Symptoms Persist Without Intervention",
      level: 3
    },

    {
      type: "text",
      content:
        "For many working professionals, stress and gut issues develop together and persist for years. Digestive symptoms such as bloating and constipation often coexist with anxiety, irritability, low energy, and reduced concentration. This occurs because stress disrupts gut function, and an imbalanced gut amplifies stress signals to the brain."
    },

    {
      type: "text",
      content:
        "Breaking this loop requires more than dietary changes alone. Interventions that actively calm the nervous system are essential to restoring gut balance and improving resilience."
    },

    {
      type: "heading",
      content: "Meditation: A Practical Tool for Nervous System and Gut Regulation",
      level: 2
    },

    {
      type: "heading",
      content: "Shifting from “Fight or Flight” to “Rest and Digest”",
      level: 3
    },

    {
      type: "text",
      content:
        "Meditation and mindfulness practices help activate the vagus nerve and shift the body into a parasympathetic state—the mode in which digestion, repair, and recovery occur. This shift is measurable through improvements in heart rate variability (HRV), a key indicator of nervous system balance."
    },

    {
      type: "text",
      content:
        "Studies have shown that regular meditation improves vagal tone, reduces gut hypersensitivity, and lowers markers of inflammation. Research published in Frontiers in Behavioral Neuroscience found that brief daily mindfulness practices led to improvements in digestive comfort and bowel regularity within weeks. By lowering cortisol levels, meditation also supports microbial diversity, allowing beneficial bacteria to recover and repopulate."
    },

    {
      type: "heading",
      content: "Evidence-Based Benefits of Meditation for Employees",
      level: 3
    },

    {
      type: "list",
      content: {
        items: [
          "Improved digestion and bowel regularity",
          "Reduced bloating and abdominal discomfort",
          "Lower inflammation and stress hormone levels",
          "Improved focus, emotional regulation, and sleep quality"
        ]
      }
    },

    {
      type: "heading",
      content: "Simple Stress-Reduction Practices for the Workplace",
      level: 2
    },

    {
      type: "heading",
      content: "Small Actions with Measurable Impact",
      level: 3
    },

    {
      type: "text",
      content:
        "Effective stress management does not require long retreats or complex routines. Small, consistent practices integrated into the workday are most effective."
    },

    {
      type: "list",
      content: {
        items: [
          "Diaphragmatic Breathing: Sitting upright and breathing deeply into the abdomen for a few minutes activates the vagus nerve and calms the gut.",
          "Body Scan Meditation: Systematically releasing tension from head to toe reduces background stress signals that interfere with digestion.",
          "Mindful Eating: Eating without distractions improves enzyme secretion, digestion, and nutrient absorption.",
          "Guided Relaxation or Yoga Nidra: Practiced before sleep, these techniques lower cortisol and support overnight gut repair."
        ]
      }
    },

    {
      type: "heading",
      content: "Reframing Stress in the Workplace",
      level: 2
    },

    {
      type: "heading",
      content: "Stress as a Signal, Not a Failure",
      level: 3
    },

    {
      type: "text",
      content:
        "Stress itself is not harmful. Short-term stress responses are necessary for alertness and performance. Problems arise when recovery is absent. Without pauses for regulation, the nervous system remains activated, digestion remains suppressed, and the body pays the cost over time."
    },

    {
      type: "text",
      content:
        "Learning to pause, breathe, and reset throughout the day restores balance. Over time, this builds resilience—the ability to return to calm more efficiently after challenges."
    },

    {
      type: "heading",
      content: "Key Takeaway for Working Professionals",
      level: 2
    },

    {
      type: "text",
      content:
        "Your gut responds closely to your emotional and mental state. Every mindful breath and moment of pause sends signals of safety to your nervous system and microbiome. When the mind relaxes, the gut begins to heal. When the gut heals, clarity, energy, and emotional balance follow—supporting both wellbeing and workplace performance."
    }
  ]
}
,
       {
  id: "microhabits",
  title: "Microhabits for Improvement",
  contentBlocks: [
    {
      type: "video",
      content: {
        videoUrl: "https://www.youtube.com/embed/LS_zFcBYpn4",
        title: "Microhabits for Gut Health"
      }
    },

    {
      type: "heading",
      content: "Microhabits for Improvement: Gut Health, Nervous System & Metabolic Resilience",
      level: 1
    },

    {
      type: "text",
      content: "For High-Stress Corporate Work Lives"
    },

    {
      type: "heading",
      content: "The Real Problem",
      level: 2
    },

    {
      type: "text",
      content:
        "Most professionals today are not dealing with a single disease. They are dealing with a constantly overstimulated nervous system and a gradually imbalanced gut."
    },

    {
      type: "text",
      content:
        "Long work hours, continuous screen exposure, excess caffeine, irregular meals, poor sleep, and endless scrolling keep the body locked in a persistent fight-or-flight state. When the nervous system remains overactivated, digestion slows. And when gut function suffers, it quietly impacts energy levels, focus, mood, immunity, metabolism, and long-term disease risk."
    },

    {
      type: "text",
      content:
        "The challenge today is not a lack of information, but overload—pulling attention in every direction and keeping the body in a state of chronic alert."
    },

    {
      type: "heading",
      content: "Why This Matters",
      level: 2
    },

    {
      type: "text",
      content:
        "Most lifestyle-related conditions seen in working professionals—acidity, bloating, IBS, insulin resistance, fatigue, brain fog, and stubborn weight gain—do not appear overnight."
    },

    {
      type: "text",
      content:
        "They develop gradually through habits that feel productive, normal, and socially acceptable:"
    },

    {
      type: "list",
      content: {
        items: [
          "Multitasking while eating",
          "Working through meals",
          "Scrolling until sleep",
          "Powering through fatigue with caffeine"
        ]
      }
    },

    {
      type: "text",
      content:
        "This is not a conversation about extreme diets or rigid routines. It is about microhabits—small, repeatable daily actions that quietly reset the gut, regulate the nervous system, and strengthen metabolic resilience."
    },

    {
      type: "text",
      content:
        "Below are six microhabits that can make a measurable difference without disrupting a demanding workday."
    },

    {
      type: "heading",
      content: "Top 6 Microhabits That Reset Gut Health & Metabolism",
      level: 2
    },

    {
      type: "heading",
      content: "1. The Caffeine Cut-Off Rule",
      level: 3
    },

    {
      type: "text",
      content:
        "Caffeine is one of the most underestimated disruptors of gut and nervous system health. Late caffeine intake keeps cortisol elevated, irritates the gut lining, fragments sleep quality, and worsens insulin sensitivity the following day."
    },

    {
      type: "heading",
      content: "What to do instead:",
      level: 4
    },

    {
      type: "text",
      content:
        "Finish all caffeine earlier in the day. Past afternoon, switch to herbal teas, warm water, or a short walk to maintain alertness without overstimulation."
    },

    {
      type: "heading",
      content: "2. Protein as the First Bite",
      level: 3
    },

    {
      type: "text",
      content:
        "The sequence in which food is consumed matters more than most people realize. Starting meals with protein or fiber slows glucose spikes, improves satiety, and enhances gut-brain hormone signaling."
    },

    {
      type: "text",
      content:
        "This small shift helps reduce post-meal fatigue, cravings, and long-term metabolic strain."
    },

    {
      type: "heading",
      content: "What to do instead:",
      level: 4
    },

    {
      type: "text",
      content:
        "Begin meals with protein-rich foods such as dal, curd, paneer, eggs, chicken, tofu, or legumes before moving to carbohydrates."
    },

    {
      type: "heading",
      content: "3. Single-Task Eating (Unlearning the Scroll)",
      level: 3
    },

    {
      type: "text",
      content:
        "Modern digital habits have trained the brain to eat, scroll, reply, and think simultaneously. Digestion, however, requires calm—not distraction."
    },

    {
      type: "text",
      content:
        "Eating while scrolling keeps the nervous system activated, reduces digestive enzyme release, and often worsens bloating and acidity."
    },

    {
      type: "heading",
      content: "What to do instead:",
      level: 4
    },

    {
      type: "text",
      content:
        "Commit to at least one screen-free meal per day. Even 10 minutes of focused eating signals safety to the gut and significantly improves digestion."
    },

    {
      type: "heading",
      content: "4. Capturing Wins from the Day",
      level: 3
    },

    {
      type: "text",
      content:
        "A constantly busy mind keeps the stress response switched on, even during rest. Writing down two or three wins from the day sends signals of completion to the brain, lowers cortisol levels, and improves sleep quality."
    },

    {
      type: "heading",
      content: "What to do instead:",
      level: 4
    },

    {
      type: "text",
      content:
        "Spend three minutes before bed writing down what went well or listing your major wins from the day—personal or professional."
    },

    {
      type: "heading",
      content: "5. Somatic Shaking for Nervous System Reset",
      level: 3
    },

    {
      type: "text",
      content:
        "Stress is not only mental—it is stored physically in the body. Somatic shaking, rooted in traditional practices and supported by modern neuroscience, helps release stored tension and improves vagal tone."
    },

    {
      type: "text",
      content:
        "A regulated nervous system directly supports digestion and reduces gut sensitivity."
    },

    {
      type: "heading",
      content: "What to do instead:",
      level: 4
    },

    {
      type: "text",
      content:
        "Practice one to two minutes of gentle shaking in the morning to release tension, reset the nervous system, and improve energy for the day ahead."
    },

    {
      type: "heading",
      content: "6. The Sitting Interruption Rule",
      level: 3
    },

    {
      type: "text",
      content:
        "Long uninterrupted sitting slows metabolism, reduces gut circulation, and increases systemic inflammation. Corporate employees who sit for extended hours have significantly higher risk of metabolic dysfunction and fatigue."
    },

    {
      type: "heading",
      content: "What to do instead:",
      level: 4
    },

    {
      type: "text",
      content:
        "Interrupt sitting every 30–45 minutes with light movement, stretching, or standing meetings to support gut circulation and metabolic activity."
    },

    {
      type: "heading",
      content: "The Bigger Picture",
      level: 2
    },

    {
      type: "text",
      content:
        "These habits may appear small, but they quietly recalibrate the gut-brain axis and strengthen metabolic resilience."
    },

    {
      type: "text",
      content:
        "Health rarely declines because of one bad decision. It declines because of repeated, unnoticed microchoices made on autopilot."
    },

    {
      type: "text",
      content:
        "In a world that constantly competes for attention, health requires intention. Calm the nervous system, fix the microhabits, and the body follows."
    }
  ]
}
,
{
  id: "quiz",
  title: "Take Gut Health Quiz",
  contentBlocks: [
    {
      type: "heading",
      content: "Take the Gut Health Quiz",
      level: 1
    },

    {
      type: "text",
      content:
        "A rapid, evidence-informed gut health assessment for working professionals."
    },

    {
      type: "text",
      content:
        "Gain personalized insights in minutes by completing our <strong>Gut Health Quiz</strong>. Designed for time-constrained healthcare and corporate professionals, the quiz integrates clinically relevant symptom screening with population-scale microbiome pattern analysis to surface likely gut imbalances and modifiable risk factors."
    },

    {
      type: "heading",
      content: "What the Gut Health Quiz Covers",
      level: 2
    },

    {
      type: "list",
      content: {
        items: [
          "<strong>Digestive Symptoms:</strong> Identifies common digestive concerns such as bloating, acidity, gas, constipation, and irregular bowel movements.",
          "<strong>Bowel Health Patterns:</strong> Assesses stool frequency, consistency, and gut motility to flag elimination imbalances.",
          "<strong>Dietary Triggers:</strong> Evaluates reactions to common foods (e.g., dairy, gluten, sugar, processed foods) and eating habits that may impact gut health.",
          "<strong>Lifestyle & Stress Load:</strong> Reviews stress levels, sleep quality, physical activity, and work patterns that influence gut–brain function.",
          "<strong>Systemic Health Signals:</strong> Screens for fatigue, brain fog, skin issues, cravings, and energy fluctuations linked to gut health.",
          "<strong>Gut Resilience Indicators:</strong> Highlights factors affecting microbiome balance and the gut’s ability to adapt and recover."
        ]
      }
    },

    {
      type: "heading",
      content: "Find the Quiz Below",
      level: 3
    },

    
    {
      type: "text",
      content: "Find the Sample Report Below",
      level: 3
    },

   

    {
      type: "quizell",
      content: {
        quizKey: "oQ8cX8"
      }
    },
        {
      type: "heading",
      content: "Sample Report ",
      level: 3
    },
    {
      type: "pdf",
      content: {
        src: "/KNOW YOUR GUT.pdf",
      
      }
    }



  ]
}


      ]
    },
    {
      id: "summary",
      title: "Summary",
      modules: [
       {
  id: "course-summary",
  title: "Summary",
  contentBlocks: [
    {
      type: "heading",
      content: "Congratulations on Completing the Course!",
      level: 1
    },

    {
      type: "text",
      content:
        "We want to take a moment to congratulate you on successfully completing the course, Gut Health & Stress Resilience for Professionals. You have taken an important step toward enhancing your overall health and well-being in the workplace. This course was designed specifically for corporate employees seeking improved gut health and effective stress management strategies in their busy lives."
    },

    {
      type: "heading",
      content: "Course Overview",
      level: 2
    },

    {
      type: "text",
      content:
        "Throughout this course, you learned about the vital connection between gut health and everyday performance. You have explored how modern lifestyles impact digestion and discovered practical solutions to help you manage stress effectively. By engaging with various resources such as videos and informative articles, you have acquired valuable knowledge to support your wellness journey."
    },

    {
      type: "heading",
      content: "Key Course Objectives",
      level: 2
    },

    {
      type: "text",
      content: "By the end of this course, you should now be able to:"
    },

    {
      type: "list",
      content: {
        items: [
          "<strong>Understand Gut Health:</strong> Recognize what gut health is and why it is essential for daily performance.",
          "<strong>Impact of Lifestyle:</strong> Identify how modern lifestyles and workplace stress can negatively affect digestion.",
          "<strong>Myths vs. Facts:</strong> Dispel common misconceptions about gut health using evidence-based information.",
          "<strong>Microhabits for Improvement:</strong> Apply simple and realistic microhabits that can nurture better gut health and promote overall wellness.",
          "<strong>Stress Management Techniques:</strong> Utilize effective stress management techniques to enhance your well-being in both personal and professional environments."
        ]
      }
    },

    {
      type: "heading",
      content: "Next Steps",
      level: 2
    },

    {
      type: "text",
      content:
        "Now that you have gained insights into gut health and have developed practical strategies for managing stress, we encourage you to implement what you've learned. Remember, small, consistent changes can lead to significant improvements over time, empowering you to take charge of your health amidst the demands of the workplace."
    },

    {
      type: "text",
      content:
        "Embrace your newfound knowledge, continue exploring, and strive for a balanced lifestyle that nurtures both your body and mind."
    },

    

    {
      type: "heading",
      content: "Further Readings",
      level: 2
    },

    {
      type: "list",
      content: {
        items: [
          "Relationship between stress, diet, and gut microbiota: a cross ...",
          "Stress and digestive distress: How it can make or break ...",
          "Strategies for Employers and Employees",
          "Gut Health and Mental Well-being at Work",
          "Boost gut health to boost work performance"
        ]
      }
    }
  ]
}

      ]
    }
  ]
};


const loadProgress = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function CourseModuleClient() {
const saved = loadProgress();
 const router = useRouter();
 const searchParams = useSearchParams();

  const sectionFromUrl = searchParams.get("section");
const moduleFromUrl = searchParams.get("module");

    

const initialSection =
  sectionFromUrl !== null
    ? Number(sectionFromUrl)
    : saved?.currentSection ?? 0;

const initialModule =
  moduleFromUrl !== null
    ? Number(moduleFromUrl)
    : saved?.currentModule ?? 0;

const [currentSection, setCurrentSection] = useState(initialSection);
const [currentModule, setCurrentModule] = useState(initialModule);
useEffect(() => {
  if (sectionFromUrl === null || moduleFromUrl === null) {
    router.replace(
      `/course?section=${initialSection}&module=${initialModule}`,
      { scroll: false }
    );
  }
}, []);

useEffect(() => {
  if (sectionFromUrl !== null && moduleFromUrl !== null) {
    setCurrentSection(Number(sectionFromUrl));
    setCurrentModule(Number(moduleFromUrl));
  }
}, [sectionFromUrl, moduleFromUrl]);
const navigate = (sectionIdx, moduleIdx) => {
  setCurrentSection(sectionIdx);
  setCurrentModule(moduleIdx);

router.push(
  `/course?section=${sectionIdx}&module=${moduleIdx}`,
  { scroll: false }
);
;
};


  const [completedModules, setCompletedModules] = useState(
    new Set(saved?.completedModules ?? [])
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
 useEffect(() => {
    const data = {
      currentSection,
      currentModule,
      completedModules: Array.from(completedModules),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [currentSection, currentModule, completedModules]);


  const totalModules = courseData.sections.reduce(
    (acc, section) => acc + section.modules.length,
    0
  );
  const progressPercentage = (completedModules.size / totalModules) * 100;


  const getCurrentModule = () => {
    return courseData.sections[currentSection]?.modules[currentModule];
  };

  const getModuleId = (sectionIdx, moduleIdx) => {
    return `${courseData.sections[sectionIdx].id}-${courseData.sections[sectionIdx].modules[moduleIdx].id}`;
  };

  
  const completeAndNext = () => {
    const moduleId = getModuleId(currentSection, currentModule);
    const newCompleted = new Set(completedModules);
    newCompleted.add(moduleId);
    setCompletedModules(newCompleted);

    goToNext();
  };

  // Navigate to next module
  const goToNext = () => {
  const section = courseData.sections[currentSection];

  if (currentModule < section.modules.length - 1) {
    navigate(currentSection, currentModule + 1);
  } else if (currentSection < courseData.sections.length - 1) {
    navigate(currentSection + 1, 0);
  }
};


  // Navigate to previous module
 const goToPrevious = () => {
  if (currentModule > 0) {
    navigate(currentSection, currentModule - 1);
  } else if (currentSection > 0) {
    const prevSection = currentSection - 1;
    navigate(
      prevSection,
      courseData.sections[prevSection].modules.length - 1
    );
  }
};


  // Jump to specific module
  const jumpToModule = (sectionIdx, moduleIdx) => {
  navigate(sectionIdx, moduleIdx);
  if (window.innerWidth < 1024) setSidebarOpen(false);
};

  // Check if module is completed
  const isModuleCompleted = (sectionIdx, moduleIdx) => {
    const moduleId = getModuleId(sectionIdx, moduleIdx);
    return completedModules.has(moduleId);
  };

  // Check if we're at the first or last module
  const isFirstModule = currentSection === 0 && currentModule === 0;
  const isLastModule =
    currentSection === courseData.sections.length - 1 &&
    currentModule === courseData.sections[currentSection].modules.length - 1;

  const currentModuleData = getCurrentModule();
  const currentModuleId = getModuleId(currentSection, currentModule);
  const isCurrentCompleted = completedModules.has(currentModuleId);

  // Determine module type for sidebar icon
  const getModuleType = (module) => {
    if (!module.contentBlocks || module.contentBlocks.length === 0) return "text";
    // Check if module contains video
    const hasVideo = module.contentBlocks.some(block => block.type === "video");
    return hasVideo ? "video" : "text";
  };

 
  const renderContentBlock = (block, index) => {
    switch (block.type) {
      case "heading":
        const HeadingTag = `h${block.level || 2}`;
        const headingClasses = {
          1: "text-2xl md:text-3xl font-bold text-[#0F3D2E] mb-4",
          2: "text-xl md:text-2xl font-bold text-[#0F3D2E] mb-3 mt-6",
          3: "text-lg md:text-xl font-semibold text-[#2E6F5B] mb-2 mt-4"
        };
        return (
          <HeadingTag key={index} className={headingClasses[block.level || 2]}>
            {block.content}
          </HeadingTag>
        );

      case "text":
        return (
          <div
            key={index}
            className="text-sm md:text-base leading-relaxed text-[#0F3D2E] mb-4"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        );

      case "video":
        return (
          <div key={index} className="mb-6">
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-black">
             <iframe
  key={`${currentSection}-${currentModule}`}
  src={block.content.videoUrl}
  title={block.content.title || "Course Video"}
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  className="w-full h-full"
/>

            </div>
          </div>
        );

      case "image":
        return (
          <div key={index} className="mb-6">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={block.content.src}
                alt={block.content.alt || "Course image"}
                className="w-full h-auto"
              />
            </div>
            {block.content.caption && (
              <p className="text-sm text-[#2E6F5B] italic text-center mt-2">
                {block.content.caption}
              </p>
            )}
          </div>
        );

      case "list":
        return (
          <ul key={index} className="list-none space-y-2 mb-4 ml-4">
            {block.content.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start gap-2 text-sm md:text-base text-[#0F3D2E]">
                <span className="text-[#1FBF84] mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        );
        case "quizell":
  return (
    <div key={index} className="my-10">
      {/* Quizell mount point */}
      <div id="oQ8cX8" className="min-h-[600px]" />
    </div>
  );

  case "pdf":
  return (
    <div key={index} className="my-10">
      <div className="border rounded-xl overflow-hidden shadow-md">
        <div className="px-4 py-2 bg-gray-100 text-sm font-semibold">
          {block.content.title}
        </div>

        {/* Internal scrolling container */}
        <div className="h-[600px] overflow-y-auto bg-white">
          <iframe
            src={block.content.src}
            title={block.content.title}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );



      default:
        return null;
    }
  };
  const loadQuizell = () => {
  const oldScript = document.getElementById("quizell-script");
  if (oldScript) oldScript.remove();

  const script = document.createElement("script");
  script.src = "https://api.quizell.com/js/qzembed.js?v=24999";
  script.async = true;
  script.id = "quizell-script";
  script.setAttribute("data-qz-key", "oQ8cX8");

  document.body.appendChild(script);
};
useEffect(() => {
  if (currentModuleData?.id === "quiz") {
    loadQuizell();
  }
}, [currentModuleData?.id]);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
const [isSpeaking, setIsSpeaking] = useState(false);
const [isPaused, setIsPaused] = useState(false);

const getReadableText = () => {
  if (!currentModuleData?.contentBlocks) return "";

  return currentModuleData.contentBlocks
    .filter(
      (block) => block.type === "text" || block.type === "list"
    )
    .map((block) => {
      if (block.type === "text") {
        return block.content.replace(/<[^>]*>/g, " ");
      }
      if (block.type === "list") {
        return block.content.items
          .map((item) => item.replace(/<[^>]*>/g, " "))
          .join(" ");
      }
      return "";
    })
    .join(" ");
};

const startSpeech = () => {
  if (!window.speechSynthesis) return;

  const text = getReadableText();
  if (!text) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  utterance.onend = () => {
    setIsSpeaking(false);
    setIsPaused(false);
  };

  speechRef.current = utterance;
  window.speechSynthesis.speak(utterance);

  setIsSpeaking(true);
  setIsPaused(false);
};

const pauseSpeech = () => {
  window.speechSynthesis.pause();
  setIsPaused(true);
};

const resumeSpeech = () => {
  window.speechSynthesis.resume();
  setIsPaused(false);
};

const stopSpeech = () => {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
  setIsPaused(false);
};

// MODIFIED: Added scroll to top when module changes
useEffect(() => {
  stopSpeech();
  // Scroll to top when module changes
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [currentSection, currentModule]);





const isSummarySection =
  courseData.sections[currentSection]?.id === "summary";

const isCourseCompleted =
  Math.round(progressPercentage) === 100;



  return (
    <>
     <div className="h-20   " />
      
    <div className="flex min-h-screen bg-gradient-to-br from-[#F4F9F7] via-[#EBF5F0] to-[#E1F0E8] -mt-2 ">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <aside
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 bg-gradient-to-b from-[#2E6F5B] to-[#1F5845] text-white flex flex-col shadow-2xl overflow-hidden md:sticky fixed top-0 md:z-30 z-50 h-screen`}
      >
        <div className="  flex items-center justify-between p-4 border-b border-white/20 bg-white/5">
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 font-medium text-sm hover:text-[#1FBF84] transition-colors"
          >
            <ChevronLeft size={18} /> Course Overview
          </button>
          <X className="cursor-pointer hover:text-red-300 transition-colors lg:hidden" onClick={() => setSidebarOpen(false)} />
        </div>

        <ScrollArea className="flex-1 p-4">
         
          <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
            <p className="text-xs font-semibold mb-2 text-[#1FBF84]">Course Progress</p>
            <Progress value={progressPercentage} className="h-2 bg-white/20" />
            <p className="text-xs mt-2 text-white/80">
              {completedModules.size} of {totalModules} modules completed
            </p>
          </div>

          {courseData.sections.map((section, sectionIdx) => (
            <div key={section.id} className="mb-4">
              <p className="text-sm font-bold mb-2 text-[#1FBF84] flex items-center gap-2">
                <BookOpen size={14} />
                {section.title}
              </p>
              {section.modules.map((module, moduleIdx) => {
                const completed = isModuleCompleted(sectionIdx, moduleIdx);
                const isCurrent =
                  sectionIdx === currentSection && moduleIdx === currentModule;
                const moduleType = getModuleType(module);

                return (
                  <div
                    key={module.id}
                    onClick={() => jumpToModule(sectionIdx, moduleIdx)}
                    className={`flex items-center justify-between text-sm px-3 py-2.5 rounded-md mb-1.5 cursor-pointer transition-all ${
                      isCurrent
                        ? "bg-[#1FBF84] text-white shadow-lg scale-105"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span className="flex items-center gap-2 flex-1">
                      {moduleType === "video" ? (
                        <Play size={12} className="flex-shrink-0" />
                      ) : (
                        <BookOpen size={12} className="flex-shrink-0" />
                      )}
                      <span className="truncate">{module.title}</span>
                    </span>
                    {completed ? (
                      <CheckCircle className="text-green-300 flex-shrink-0" size={16} />
                    ) : (
                      <Circle className="text-white/40 flex-shrink-0" size={16} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
        </ScrollArea>

        <div className="p-4 border-t border-white/20 bg-white/5">
          <p className="text-xs text-white/60 text-center">
            {courseData.title}
          </p>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white shadow-md border-b border-[#E1F0E8]">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-[#E1F0E8]"
              >
                <Menu size={18} />
              </Button>
            )}
            <h1 className="text-base md:text-lg font-bold text-[#0F3D2E] truncate">
              {currentModuleData?.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#2E6F5B]">
              <Progress value={progressPercentage} className="w-20 md:w-32 h-2" />
              <span className="whitespace-nowrap">{Math.round(progressPercentage)}%</span>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700"   onClick={() => router.push("/coursepage")}>Go Back</Button>
            {isCourseCompleted && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-sm md:text-base"  onClick={() => router.push("/coursepage")}>
                Finish Course
              </Button>
            ) }
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden px-4 py-2 bg-white border-b border-[#E1F0E8]">
          <div className="flex items-center gap-2 text-xs text-[#2E6F5B]">
            <Progress value={progressPercentage} className="flex-1 h-2" />
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 px-4 md:px-8 py-6">
          <Card className="max-w-4xl mx-auto shadow-xl border-2 border-[#E1F0E8] bg-white">
            <CardContent className="p-6 md:p-8">
              {/* Voice Controls */}
<div className="flex items-center gap-3 mb-2 -mt-10 p-3 rounded-lg bg-[#F4F9F7] border border-[#E1F0E8]">
  {!isSpeaking ? (
    <Button
      size="sm"
      onClick={startSpeech}
      className="bg-[#1FBF84] hover:bg-[#17a673] text-white"
    >
      <Play size={16} className="mr-1" /> Play Audio
    </Button>
  ) : (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={isPaused ? resumeSpeech : pauseSpeech}
      >
        {isPaused ? (
          <>
            <Play size={16} className="mr-1" /> Resume
          </>
        ) : (
          <>
            <Pause size={16} className="mr-1" /> Pause
          </>
        )}
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={stopSpeech}
      >
        <Square size={16} className="mr-1" /> Stop
      </Button>
    </>
  )}
</div>

              {/* Render content blocks in order */}
              {currentModuleData?.contentBlocks?.map((block, index) => 
                renderContentBlock(block, index)
              )}

              {!isCurrentCompleted && (
                <div className="flex justify-center pt-6 mt-6 border-t border-[#E1F0E8]">
                  <Button
                    onClick={completeAndNext}
                    className="bg-[#1FBF84] hover:bg-[#17a673] text-white shadow-lg px-8"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Mark as Complete {!isLastModule && "& Continue"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollArea>

        {/* Footer Nav */}
        <div className="mx-auto w-full max-w-4xl px-4 md:px-8 py-4 bg-white border-t border-[#E1F0E8] shadow-lg">
          <div className="flex justify-between gap-5 items-center">
            <Button
              variant="ghost"
              onClick={goToPrevious}
              disabled={isFirstModule}
              className="disabled:opacity-50 hover:bg-[#E1F0E8] text-sm md:text-base"
            >
              <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
            </Button>
           <div className="text-xs md:text-sm text-[#2E6F5B] font-medium">
  {!isLastModule && (
    <span>
      Module {currentModule + 1} of{" "}
      {courseData.sections[currentSection].modules.length}
    </span>
  )}
</div>

            {isSummarySection && isCourseCompleted ? (
  <Button
    onClick={() => router.push("/coursepage")}
    disabled={!isCourseCompleted}
    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm md:text-base"
  >
    Finish
  </Button>
) : (
  <Button
    onClick={goToNext}
    disabled={isLastModule}
    className="bg-[#1FBF84] hover:bg-[#17a673] text-white disabled:opacity-50 text-sm md:text-base"
  >
   <span className="hidden sm:inline">
  {isSummarySection  ? "Finish" : "Next"}
</span>
<span className="sm:hidden">
  {isSummarySection  ? "Finish" : "Next"}
</span>

    <ChevronRight size={18} />
  </Button>
)}


          </div>
        </div>
      </div>
    </div>
    </>
  );
}