"""
StudyMate AI - Demo Data Seeder
Creates realistic academic content for Operating Systems course
"""
import uuid
from datetime import datetime, timezone, timedelta
import json
import random

DEMO_USER_ID = "demo-student-001"
DEMO_COURSE_ID = "course-os-001"

# ============================================================
# COMPREHENSIVE OPERATING SYSTEMS KNOWLEDGE BASE
# ============================================================

OS_TEXTBOOK_CHUNKS = [
    {
        "content": "A process is a program in execution. It includes the program code (text section), current activity (program counter, processor registers), process stack (temporary data such as function parameters, return addresses, local variables), data section (global variables), and heap (dynamically allocated memory). A program becomes a process when an executable file is loaded into memory. Two processes may be associated with the same program but are considered separate execution sequences.",
        "page_number": 45,
        "topic": "Process Management",
        "subtopic": "Process Concept",
        "concept": "Process Definition",
        "difficulty": "easy"
    },
    {
        "content": "A process can be in one of the following states: New (the process is being created), Running (instructions are being executed), Waiting (the process is waiting for some event to occur), Ready (the process is waiting to be assigned to a processor), Terminated (the process has finished execution). Only one process can be running on any processor core at any instant, but many processes may be ready and waiting.",
        "page_number": 48,
        "topic": "Process Management",
        "subtopic": "Process States",
        "concept": "Process State Diagram",
        "difficulty": "easy"
    },
    {
        "content": "Each process is represented in the operating system by a Process Control Block (PCB), also called a task control block. The PCB contains: Process state, Program counter, CPU registers, CPU scheduling information, Memory management information, Accounting information, I/O status information. The PCB serves as the repository for all data needed to start or restart a process, along with some accounting data.",
        "page_number": 51,
        "topic": "Process Management",
        "subtopic": "Process Control Block",
        "concept": "PCB Structure",
        "difficulty": "easy"
    },
    {
        "content": "Context switching is the mechanism by which the CPU switches from one process to another. When a context switch occurs, the kernel saves the context of the old process in its PCB and loads the saved context of the new process. Context-switch time is pure overhead because the system does no useful work while switching. Context-switch speed varies from machine to machine depending on memory speed, number of registers, and hardware support. Typical speeds range from 1 to 1000 microseconds.",
        "page_number": 67,
        "topic": "Process Management",
        "subtopic": "Context Switching",
        "concept": "Context Switch Mechanism",
        "difficulty": "medium"
    },
    {
        "content": "A thread is a basic unit of CPU utilization comprising a thread ID, program counter, register set, and stack. It shares with other threads belonging to the same process its code section, data section, and other operating-system resources such as open files and signals. A traditional process has a single thread of control. If a process has multiple threads of control, it can perform more than one task at a time. Multithreading provides benefits including responsiveness, resource sharing, economy, and scalability.",
        "page_number": 85,
        "topic": "Threads",
        "subtopic": "Thread Concept",
        "concept": "Thread vs Process",
        "difficulty": "medium"
    },
    {
        "content": "There are two types of threads: user-level threads (ULTs) managed by a thread library in user space, and kernel-level threads (KLTs) managed directly by the operating system. User threads are supported above the kernel and managed without kernel support. Kernel threads are supported and managed directly by the operating system. Most modern operating systems support kernel threads. Three common models relate user and kernel threads: Many-to-One, One-to-One, and Many-to-Many.",
        "page_number": 91,
        "topic": "Threads",
        "subtopic": "Thread Types",
        "concept": "User vs Kernel Threads",
        "difficulty": "medium"
    },
    {
        "content": "The critical-section problem is to design a protocol that processes can use to cooperate. Each process has a segment of code called a critical section in which the process may be updating shared data. When one process is executing in its critical section, no other process should be allowed to execute in its critical section. A solution to the critical-section problem must satisfy three requirements: Mutual Exclusion, Progress, and Bounded Waiting.",
        "page_number": 120,
        "topic": "Synchronization",
        "subtopic": "Critical Section Problem",
        "concept": "Critical Section Requirements",
        "difficulty": "medium"
    },
    {
        "content": "A semaphore S is an integer variable that, apart from initialization, is accessed only through two standard atomic operations: wait() and signal() (originally called P() and V()). The wait() operation decrements the semaphore value, and if the value becomes negative, the process is blocked. The signal() operation increments the semaphore value, and if the value is non-positive, a blocked process is unblocked. Counting semaphores can range over an unrestricted domain, while binary semaphores (mutex locks) can only be 0 or 1.",
        "page_number": 128,
        "topic": "Synchronization",
        "subtopic": "Semaphores",
        "concept": "Semaphore Operations",
        "difficulty": "medium"
    },
    {
        "content": "A monitor is a high-level synchronization construct. A monitor type is an ADT (Abstract Data Type) that presents a set of programmer-defined operations that are provided mutual exclusion within the monitor. The monitor construct ensures that only one process at a time is active within the monitor. A process that cannot continue blocks itself on a condition variable using wait(). Another process can wake it up using signal() on that condition variable.",
        "page_number": 135,
        "topic": "Synchronization",
        "subtopic": "Monitors",
        "concept": "Monitor Construct",
        "difficulty": "hard"
    },
    {
        "content": "A deadlock situation can arise if four conditions hold simultaneously: (1) Mutual Exclusion - at least one resource must be held in a non-sharable mode, (2) Hold and Wait - a process must be holding at least one resource and waiting to acquire additional resources held by other processes, (3) No Preemption - a resource can be released only voluntarily by the process holding it, (4) Circular Wait - there must exist a set of waiting processes such that each process is waiting for a resource held by the next process in the chain.",
        "page_number": 142,
        "topic": "Deadlocks",
        "subtopic": "Necessary Conditions",
        "concept": "Four Necessary Conditions",
        "difficulty": "medium"
    },
    {
        "content": "A Resource Allocation Graph (RAG) is a directed graph used to describe deadlocks. The graph consists of vertices (processes and resources) and edges (request edges and assignment edges). A request edge Pi → Rj indicates that process Pi has requested resource Rj. An assignment edge Rj → Pi indicates that resource Rj has been allocated to process Pi. If the graph contains no cycles, then no process is deadlocked. If there is a cycle, deadlock may exist.",
        "page_number": 146,
        "topic": "Deadlocks",
        "subtopic": "Resource Allocation Graph",
        "concept": "RAG Analysis",
        "difficulty": "medium"
    },
    {
        "content": "Deadlock prevention ensures that at least one of the four necessary conditions cannot hold. We can prevent Mutual Exclusion by making resources sharable (not always possible). We can prevent Hold and Wait by requiring processes to request all resources at once. We can prevent No Preemption by preempting resources from waiting processes. We can prevent Circular Wait by imposing a total ordering on resource types.",
        "page_number": 150,
        "topic": "Deadlocks",
        "subtopic": "Deadlock Prevention",
        "concept": "Prevention Strategies",
        "difficulty": "medium"
    },
    {
        "content": "Deadlock avoidance requires additional information about which resources a process will request during its lifetime. With this knowledge, the system can decide whether to grant or delay a request. The simplest and most useful model requires that each process declare the maximum number of resources of each type it may need. The system dynamically examines the resource-allocation state to ensure there can never be a circular-wait condition. The resource-allocation state is defined by the number of available and allocated resources and the maximum demands of the processes.",
        "page_number": 152,
        "topic": "Deadlocks",
        "subtopic": "Deadlock Avoidance",
        "concept": "Safe State",
        "difficulty": "hard"
    },
    {
        "content": "The Banker's Algorithm is a deadlock avoidance algorithm. When a process requests resources, the system must determine whether allocating these resources will leave the system in a safe state. A state is safe if the system can allocate resources to each process in some order and still avoid deadlock. The algorithm uses several data structures: Available (vector of available resources), Max (matrix of maximum demand), Allocation (matrix of currently allocated), Need (matrix of remaining need where Need = Max - Allocation).",
        "page_number": 155,
        "topic": "Deadlocks",
        "subtopic": "Banker's Algorithm",
        "concept": "Banker's Algorithm Steps",
        "difficulty": "hard"
    },
    {
        "content": "The Safety Algorithm determines if a system is in a safe state: (1) Initialize Work = Available and Finish[i] = false for all i. (2) Find an index i such that Finish[i] == false and Need[i] <= Work. If no such i exists, go to step 4. (3) Work = Work + Allocation[i], set Finish[i] = true, go to step 2. (4) If Finish[i] == true for all i, then the system is in a safe state. The Resource-Request Algorithm extends this to handle incoming requests.",
        "page_number": 158,
        "topic": "Deadlocks",
        "subtopic": "Banker's Algorithm",
        "concept": "Safety Algorithm",
        "difficulty": "hard"
    },
    {
        "content": "Memory management is the functionality of an operating system which handles or manages primary memory and moves processes back and forth between main memory and disk during execution. The main purpose of memory management is to efficiently allocate memory to processes and free it when no longer needed. It keeps track of each memory location, whether it is allocated or free. Key concepts include logical vs physical address space, memory allocation strategies, paging, and segmentation.",
        "page_number": 170,
        "topic": "Memory Management",
        "subtopic": "Memory Basics",
        "concept": "Memory Management Overview",
        "difficulty": "easy"
    },
    {
        "content": "Paging is a memory management scheme that permits the physical address space of a process to be noncontiguous. It avoids external fragmentation and the need for compaction. The basic method divides physical memory into fixed-sized blocks called frames and divides logical memory into blocks of the same size called pages. When a process is loaded, its pages are loaded into any available memory frames. A page table maps logical page numbers to physical frame numbers.",
        "page_number": 180,
        "topic": "Memory Management",
        "subtopic": "Paging",
        "concept": "Page Table Mechanism",
        "difficulty": "medium"
    },
    {
        "content": "Virtual memory is a technique that allows the execution of processes that are not completely in memory. It separates the user's logical memory from physical memory, allowing programs larger than physical memory to execute. Virtual memory can be implemented via demand paging, where pages are loaded only when they are needed. A page fault occurs when a process accesses a page that is not currently in memory, triggering the operating system to load the page from disk.",
        "page_number": 195,
        "topic": "Memory Management",
        "subtopic": "Virtual Memory",
        "concept": "Demand Paging",
        "difficulty": "hard"
    },
    {
        "content": "Page replacement algorithms decide which page to evict when a page fault occurs and no free frames are available. Common algorithms include: FIFO (First-In-First-Out) - replaces the oldest page, LRU (Least Recently Used) - replaces the page that has not been used for the longest time, Optimal - replaces the page that will not be used for the longest time in the future (theoretical), Clock (Second Chance) - gives each page a second chance before replacement.",
        "page_number": 205,
        "topic": "Memory Management",
        "subtopic": "Page Replacement",
        "concept": "Replacement Algorithms",
        "difficulty": "hard"
    },
]

OS_SLIDES_CHUNKS = [
    {
        "content": "Process: A program in execution. Components: Code (text section), Data section (global variables), Stack (function calls), Heap (dynamic allocation), Program counter, Registers.",
        "slide_number": 12,
        "topic": "Process Management",
        "subtopic": "Process Concept",
        "concept": "Process Components",
        "difficulty": "easy"
    },
    {
        "content": "Process States: New → Ready → Running → Waiting → Ready → Running → Terminated. State transitions are caused by: scheduling decisions, I/O requests, interrupts, and process completion.",
        "slide_number": 15,
        "topic": "Process Management",
        "subtopic": "Process States",
        "concept": "State Transitions",
        "difficulty": "easy"
    },
    {
        "content": "Context Switching Steps: 1) Save state of current process to its PCB. 2) Update process state. 3) Move PCB to appropriate queue. 4) Select next process. 5) Update memory management structures. 6) Restore state of selected process from its PCB. 7) Resume execution.",
        "slide_number": 20,
        "topic": "Process Management",
        "subtopic": "Context Switching",
        "concept": "Context Switch Steps",
        "difficulty": "medium"
    },
    {
        "content": "Thread vs Process: Threads share code, data, and OS resources. Threads have their own stack, registers, and program counter. Creating threads is faster than processes. Context switching between threads is faster. Multithreading improves responsiveness, resource sharing, economy, and scalability.",
        "slide_number": 24,
        "topic": "Threads",
        "subtopic": "Thread Concept",
        "concept": "Thread Advantages",
        "difficulty": "medium"
    },
    {
        "content": "Critical Section Problem: Solution must satisfy: 1) Mutual Exclusion - only one process in CS at a time. 2) Progress - if no process in CS and some want to enter, selection cannot be postponed indefinitely. 3) Bounded Waiting - a bound must exist on the number of times other processes enter CS after a process has requested entry.",
        "slide_number": 30,
        "topic": "Synchronization",
        "subtopic": "Critical Section",
        "concept": "CS Requirements",
        "difficulty": "medium"
    },
    {
        "content": "Semaphore: An integer variable accessed via atomic operations wait() and signal(). Binary semaphore (mutex): value 0 or 1. Counting semaphore: unrestricted integer value. Used for mutual exclusion and process synchronization. Can cause busy waiting (spinlocks) or use blocking/waking.",
        "slide_number": 35,
        "topic": "Synchronization",
        "subtopic": "Semaphores",
        "concept": "Semaphore Types",
        "difficulty": "medium"
    },
    {
        "content": "Four Necessary Conditions for Deadlock: 1) Mutual Exclusion - nonsharable resources. 2) Hold and Wait - process holds resources while waiting for others. 3) No Preemption - resources released only voluntarily. 4) Circular Wait - circular chain of processes waiting. ALL four must hold simultaneously for deadlock.",
        "slide_number": 42,
        "topic": "Deadlocks",
        "subtopic": "Necessary Conditions",
        "concept": "Deadlock Conditions",
        "difficulty": "medium"
    },
    {
        "content": "Deadlock Prevention vs Avoidance: Prevention - ensure one of four conditions never holds (restrictive, reduces utilization). Avoidance - allow all conditions but make careful allocation decisions (requires future knowledge). Detection - allow deadlock to occur, detect it, recover. Ignorance - pretend deadlock never occurs (Ostrich algorithm, used by most OS).",
        "slide_number": 45,
        "topic": "Deadlocks",
        "subtopic": "Handling Strategies",
        "concept": "Prevention vs Avoidance",
        "difficulty": "hard"
    },
    {
        "content": "Banker's Algorithm: Data structures: Available[m], Max[n][m], Allocation[n][m], Need[n][m]. Need[i][j] = Max[i][j] - Allocation[i][j]. Safety check: find sequence where all processes can finish. Resource request: grant only if resulting state is safe.",
        "slide_number": 48,
        "topic": "Deadlocks",
        "subtopic": "Banker's Algorithm",
        "concept": "Algorithm Data Structures",
        "difficulty": "hard"
    },
    {
        "content": "Memory Management Techniques: Contiguous Allocation (fixed/variable partitioning), Paging (non-contiguous, fixed-size pages/frames), Segmentation (logical units of variable size), Paged Segmentation (combination). Each has tradeoffs in fragmentation, sharing, and protection.",
        "slide_number": 55,
        "topic": "Memory Management",
        "subtopic": "Memory Techniques",
        "concept": "Allocation Methods",
        "difficulty": "medium"
    },
    {
        "content": "Virtual Memory Benefits: Programs larger than physical memory can run. More efficient process creation. More programs run concurrently. Less I/O for loading. Implementation: Demand paging, page tables, TLB, page replacement. Thrashing occurs when page fault rate is too high.",
        "slide_number": 60,
        "topic": "Memory Management",
        "subtopic": "Virtual Memory",
        "concept": "Virtual Memory Advantages",
        "difficulty": "medium"
    },
]

OS_VIDEO_CHUNKS = [
    {
        "content": "A process is essentially a program that's running on your computer. Think of a program as a recipe sitting in a cookbook - it's just instructions. A process is when you actually start cooking - you have the recipe (code), the ingredients (data), and you're actively following steps. The operating system manages all these cooking sessions happening simultaneously in your kitchen.",
        "timestamp_start": "08:32",
        "timestamp_end": "10:15",
        "topic": "Process Management",
        "subtopic": "Process Concept",
        "concept": "Process Analogy",
        "difficulty": "easy"
    },
    {
        "content": "Process states work like a traffic system. When a process is created, it enters the 'New' state. Then it moves to 'Ready' - like a car at a traffic light waiting for green. When the scheduler picks it, it goes to 'Running' - the car is now moving through the intersection. If it needs I/O, it moves to 'Waiting' - like pulling over to refuel. After I/O completes, it goes back to 'Ready'.",
        "timestamp_start": "11:20",
        "timestamp_end": "13:45",
        "topic": "Process Management",
        "subtopic": "Process States",
        "concept": "State Transitions Explained",
        "difficulty": "easy"
    },
    {
        "content": "Context switching is like a chef working on multiple dishes. When the timer goes off for one dish, the chef saves where they were (context save), and switches to another dish (context restore). The key overhead is the time spent saving and restoring - the chef isn't actually cooking during the switch. This is why too many context switches slow down the system.",
        "timestamp_start": "18:42",
        "timestamp_end": "21:30",
        "topic": "Process Management",
        "subtopic": "Context Switching",
        "concept": "Context Switch Overhead",
        "difficulty": "medium"
    },
    {
        "content": "Threads are like workers in the same office. They share the office space (address space), the filing cabinets (data), and the coffee machine (resources). But each worker has their own desk (stack) and their own to-do list (program counter). Creating a new thread is like hiring a new worker for the same office - much cheaper than renting an entirely new office (creating a new process).",
        "timestamp_start": "25:00",
        "timestamp_end": "28:15",
        "topic": "Threads",
        "subtopic": "Thread Concept",
        "concept": "Thread Analogy",
        "difficulty": "easy"
    },
    {
        "content": "The critical section problem is like having a single printer in an office. If two people try to print at the same time, the output gets jumbled. The solution is a protocol: check if the printer is free, claim it, print your document, then release it. Three properties must hold: only one person prints at a time (mutual exclusion), someone always gets to print (progress), and no one waits forever (bounded waiting).",
        "timestamp_start": "32:15",
        "timestamp_end": "35:40",
        "topic": "Synchronization",
        "subtopic": "Critical Section",
        "concept": "CS Problem Explained",
        "difficulty": "medium"
    },
    {
        "content": "A semaphore is like a bouncer at a club. A binary semaphore is a bouncer who lets only one person in at a time. A counting semaphore is a bouncer who counts and allows up to N people. The wait() operation is 'can I come in?' - if the count is positive, enter and decrement. If zero, wait outside. The signal() operation is 'I'm leaving' - increment the count and let someone in.",
        "timestamp_start": "37:00",
        "timestamp_end": "40:20",
        "topic": "Synchronization",
        "subtopic": "Semaphores",
        "concept": "Semaphore Analogy",
        "difficulty": "medium"
    },
    {
        "content": "Now let's talk about deadlocks. Imagine four cars at a four-way intersection, each blocking the next. No car can move forward because the intersection is occupied by another car. This is deadlock. Four conditions must all be true: each car occupies a lane (mutual exclusion), each car holds its lane while waiting to cross (hold and wait), no tow truck forces cars out (no preemption), and they form a circle (circular wait).",
        "timestamp_start": "44:21",
        "timestamp_end": "48:30",
        "topic": "Deadlocks",
        "subtopic": "Necessary Conditions",
        "concept": "Deadlock Analogy",
        "difficulty": "medium"
    },
    {
        "content": "The Banker's Algorithm works like a careful banker managing loans. The banker knows each customer's maximum possible loan request. Before granting any loan, the banker checks: 'If I give this money, can I still ensure all other customers can eventually get their full loans and pay me back?' If yes (safe state), grant the loan. If no (unsafe state), make the customer wait. This prevents the bank from ever going bankrupt (deadlock).",
        "timestamp_start": "51:13",
        "timestamp_end": "55:45",
        "topic": "Deadlocks",
        "subtopic": "Banker's Algorithm",
        "concept": "Banker's Algorithm Analogy",
        "difficulty": "hard"
    },
    {
        "content": "Virtual memory is like having a desk with limited space but a huge filing cabinet nearby. You only keep the papers you're currently working on (pages in memory) on your desk. When you need a paper that's in the cabinet (page fault), you put away one paper from your desk and get the needed one from the cabinet. The key insight is that at any given moment, you only need a small portion of all your papers.",
        "timestamp_start": "1:02:30",
        "timestamp_end": "1:06:15",
        "topic": "Memory Management",
        "subtopic": "Virtual Memory",
        "concept": "Virtual Memory Analogy",
        "difficulty": "medium"
    },
]


def get_demo_documents():
    return [
        {
            "id": "doc-textbook-001",
            "name": "Operating Systems Textbook",
            "file_type": "pdf",
            "status": "completed",
            "file_size": 15728640,  # ~15MB
        },
        {
            "id": "doc-slides-001",
            "name": "OS Lecture Slides",
            "file_type": "pptx",
            "status": "completed",
            "file_size": 5242880,  # ~5MB
        },
        {
            "id": "doc-video-001",
            "name": "OS Lecture Video",
            "file_type": "mp4",
            "status": "completed",
            "file_size": 157286400,  # ~150MB
        },
    ]


def get_demo_topics():
    return [
        {
            "id": "topic-pm",
            "name": "Process Management",
            "unit": "Unit 1",
            "parent_topic_id": None,
            "description": "Covers process concepts, states, PCB, context switching, and scheduling.",
            "difficulty": "easy",
            "order_index": 1,
            "subtopics": [
                {"id": "topic-pm-concept", "name": "Process Concept"},
                {"id": "topic-pm-states", "name": "Process States"},
                {"id": "topic-pm-pcb", "name": "Process Control Block"},
                {"id": "topic-pm-cs", "name": "Context Switching"},
            ],
            "concepts": [
                "Process Definition", "Process Components", "Process State Diagram",
                "State Transitions", "PCB Structure", "Context Switch Mechanism"
            ]
        },
        {
            "id": "topic-threads",
            "name": "Threads",
            "unit": "Unit 1",
            "parent_topic_id": None,
            "description": "Thread concepts, types, multithreading models, and thread libraries.",
            "difficulty": "medium",
            "order_index": 2,
            "subtopics": [
                {"id": "topic-th-concept", "name": "Thread Concept"},
                {"id": "topic-th-types", "name": "Thread Types"},
                {"id": "topic-th-models", "name": "Multithreading Models"},
            ],
            "concepts": [
                "Thread vs Process", "User vs Kernel Threads", "Thread Advantages",
                "Multithreading Models"
            ]
        },
        {
            "id": "topic-sync",
            "name": "Synchronization",
            "unit": "Unit 2",
            "parent_topic_id": None,
            "description": "Process synchronization, critical sections, semaphores, and monitors.",
            "difficulty": "medium",
            "order_index": 3,
            "subtopics": [
                {"id": "topic-sync-cs", "name": "Critical Section Problem"},
                {"id": "topic-sync-sem", "name": "Semaphores"},
                {"id": "topic-sync-mon", "name": "Monitors"},
            ],
            "concepts": [
                "Critical Section Requirements", "Mutual Exclusion", "Semaphore Operations",
                "Binary vs Counting Semaphores", "Monitor Construct"
            ]
        },
        {
            "id": "topic-dead",
            "name": "Deadlocks",
            "unit": "Unit 2",
            "parent_topic_id": None,
            "description": "Deadlock conditions, prevention, avoidance, detection, and the Banker's Algorithm.",
            "difficulty": "hard",
            "order_index": 4,
            "subtopics": [
                {"id": "topic-dead-cond", "name": "Necessary Conditions"},
                {"id": "topic-dead-rag", "name": "Resource Allocation Graph"},
                {"id": "topic-dead-prev", "name": "Deadlock Prevention"},
                {"id": "topic-dead-avoid", "name": "Deadlock Avoidance"},
                {"id": "topic-dead-banker", "name": "Banker's Algorithm"},
            ],
            "concepts": [
                "Four Necessary Conditions", "RAG Analysis", "Prevention Strategies",
                "Safe State", "Banker's Algorithm Steps", "Safety Algorithm"
            ]
        },
        {
            "id": "topic-mem",
            "name": "Memory Management",
            "unit": "Unit 3",
            "parent_topic_id": None,
            "description": "Memory allocation, paging, segmentation, virtual memory, and page replacement.",
            "difficulty": "hard",
            "order_index": 5,
            "subtopics": [
                {"id": "topic-mem-basics", "name": "Memory Basics"},
                {"id": "topic-mem-paging", "name": "Paging"},
                {"id": "topic-mem-vm", "name": "Virtual Memory"},
                {"id": "topic-mem-pr", "name": "Page Replacement"},
            ],
            "concepts": [
                "Memory Management Overview", "Page Table Mechanism", "Demand Paging",
                "Replacement Algorithms", "Thrashing"
            ]
        },
    ]


def get_topic_prerequisites():
    return [
        ("topic-threads", "topic-pm"),
        ("topic-sync", "topic-threads"),
        ("topic-dead", "topic-sync"),
        ("topic-dead-banker", "topic-dead-cond"),
        ("topic-mem", "topic-pm"),
    ]


def get_demo_mastery():
    return [
        {"topic": "Process Management", "mastery_score": 0.81, "confidence": 0.85, "attempts": 15, "correct": 12},
        {"topic": "Threads", "mastery_score": 0.63, "confidence": 0.70, "attempts": 10, "correct": 6},
        {"topic": "Synchronization", "mastery_score": 0.42, "confidence": 0.55, "attempts": 12, "correct": 5},
        {"topic": "Deadlocks", "mastery_score": 0.51, "confidence": 0.60, "attempts": 14, "correct": 7},
        {"topic": "Memory Management", "mastery_score": 0.64, "confidence": 0.68, "attempts": 8, "correct": 5},
    ]


# ============================================================
# EVALUATION TEST DATASET
# ============================================================

EVALUATION_QUESTIONS = [
    {
        "question": "What are the four necessary conditions for deadlock?",
        "expected_answer": "The four necessary conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. All four must hold simultaneously for deadlock to occur.",
        "source_chunk_topic": "Deadlocks",
        "type": "source_grounded",
        "expected_source": "Textbook Page 142"
    },
    {
        "question": "Explain the difference between a process and a thread.",
        "expected_answer": "A process is a program in execution with its own address space. A thread is a basic unit of CPU utilization within a process, sharing the code, data, and resources with other threads of the same process, but having its own stack, registers, and program counter.",
        "source_chunk_topic": "Threads",
        "type": "source_grounded",
        "expected_source": "Textbook Page 85"
    },
    {
        "question": "How does the Banker's Algorithm ensure deadlock avoidance?",
        "expected_answer": "The Banker's Algorithm checks if granting a resource request would leave the system in a safe state, where all processes can eventually complete. It uses Available, Max, Allocation, and Need matrices to determine safety.",
        "source_chunk_topic": "Deadlocks",
        "type": "multi_hop",
        "expected_source": "Textbook Page 155"
    },
    {
        "question": "What is the difference between TCP and UDP?",
        "expected_answer": "",
        "source_chunk_topic": None,
        "type": "off_material",
        "expected_source": None
    },
    {
        "question": "On which page of the textbook are the necessary conditions for deadlock described?",
        "expected_answer": "Page 142",
        "source_chunk_topic": "Deadlocks",
        "type": "citation",
        "expected_source": "Textbook Page 142"
    },
    {
        "question": "What are the three requirements for a solution to the critical-section problem?",
        "expected_answer": "The three requirements are: Mutual Exclusion (only one process in CS at a time), Progress (selection cannot be postponed indefinitely), and Bounded Waiting (there is a bound on waiting time).",
        "source_chunk_topic": "Synchronization",
        "type": "source_grounded",
        "expected_source": "Textbook Page 120"
    },
    {
        "question": "What happens during a page fault in virtual memory?",
        "expected_answer": "A page fault occurs when a process accesses a page not currently in memory. The OS traps to load the required page from disk into an available frame, updates the page table, and restarts the instruction.",
        "source_chunk_topic": "Memory Management",
        "type": "source_grounded",
        "expected_source": "Textbook Page 195"
    },
    {
        "question": "Compare deadlock prevention with deadlock avoidance strategies.",
        "expected_answer": "Prevention ensures one of four necessary conditions never holds (restrictive, reduces utilization). Avoidance allows all conditions but makes careful allocation decisions requiring future knowledge of resource needs.",
        "source_chunk_topic": "Deadlocks",
        "type": "multi_hop",
        "expected_source": "Slides 42, 45"
    },
]
