/** Reusable binary min-heap priority queue. */
export class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0]!;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top.item;
  }

  peek(): T | undefined {
    return this.heap[0]?.item;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.heap[parent]!.priority <= this.heap[i]!.priority) break;
      this.swap(parent, i);
      i = parent;
    }
  }

  private bubbleDown(index: number): void {
    let i = index;
    const n = this.heap.length;
    for (;;) {
      const left = i * 2 + 1;
      const right = left + 1;
      let smallest = i;
      if (left < n && this.heap[left]!.priority < this.heap[smallest]!.priority) smallest = left;
      if (right < n && this.heap[right]!.priority < this.heap[smallest]!.priority) smallest = right;
      if (smallest === i) break;
      this.swap(smallest, i);
      i = smallest;
    }
  }

  private swap(a: number, b: number): void {
    const tmp = this.heap[a]!;
    this.heap[a] = this.heap[b]!;
    this.heap[b] = tmp;
  }
}
