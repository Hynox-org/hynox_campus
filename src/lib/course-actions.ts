'use server';

import { createClient } from './supabase-server';

export interface CourseData {
  code: string;
  name: string;
  description?: string;
  target_audience: 'school' | 'college' | 'all';
}

export interface LevelData {
  course_id: string;
  title: string;
  description?: string;
  order_index?: number;
}

export interface TopicData {
  level_id: string;
  title: string;
  type: 'theory' | 'lab';
  content?: string;
  tools?: string[];
  order_index?: number;
}

export async function createCourse(course: CourseData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createCourseLevel(level: LevelData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course_levels')
    .insert(level)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function createCourseTopic(topic: TopicData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course_topics')
    .insert(topic)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function fetchAllCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function fetchFullCourseFramework(courseId: string) {
  const supabase = await createClient();
  
  // Fetch levels
  const { data: levels, error: levelsError } = await supabase
    .from('course_levels')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (levelsError) return { success: false, error: levelsError.message };

  // Fetch all topics inside the levels
  const levelIds = (levels || []).map(l => l.id);
  
  let topics: any[] = [];
  if (levelIds.length > 0) {
    const { data: topicsData, error: topicsError } = await supabase
      .from('course_topics')
      .select('*')
      .in('level_id', levelIds)
      .order('order_index', { ascending: true });
      
    if (topicsError) return { success: false, error: topicsError.message };
    topics = topicsData || [];
  }

  // Combine them into a tree structure
  const structure = levels.map(level => {
    return {
      ...level,
      topics: topics.filter(t => t.level_id === level.id)
    };
  });

  return { success: true, data: structure };
}
