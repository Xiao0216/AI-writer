"""
文枢AI - 知识图谱引擎
核心功能：
1. 自动从文本中抽取实体（角色、地点、事件、设定等）
2. 构建实体间的关联关系
3. 存储到Neo4j图数据库
4. 向量化存储到Milvus进行语义检索
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from loguru import logger
import re

from config import settings


@dataclass
class Entity:
    """实体基类"""
    id: str
    name: str
    entity_type: str
    description: str = ""
    attributes: Dict[str, Any] = field(default_factory=dict)
    source_chapter: int = 0
    

@dataclass
class Character(Entity):
    """角色实体"""
    entity_type: str = "character"
    gender: str = ""
    age: str = ""
    personality: str = ""
    appearance: str = ""
    background: str = ""
    power_level: str = ""
    relationships: Dict[str, str] = field(default_factory=dict)
    

@dataclass
class WorldSetting(Entity):
    """世界观设定"""
    entity_type: str = "world_setting"
    setting_type: str = ""  # geography, faction, power_system, rule, culture
    related_characters: List[str] = field(default_factory=list)
    

@dataclass
class TimelineEvent(Entity):
    """时间线事件"""
    entity_type: str = "timeline_event"
    event_time: str = ""
    involved_characters: List[str] = field(default_factory=list)
    consequences: List[str] = field(default_factory=list)
    

@dataclass
class Foreshadowing(Entity):
    """伏笔"""
    entity_type: str = "foreshadowing"
    plant_chapter: int = 0
    expected_recall_chapter: Optional[int] = None
    actual_recall_chapter: Optional[int] = None
    status: str = "planted"  # planted, recalled, abandoned
    related_characters: List[str] = field(default_factory=list)


class KnowledgeGraphEngine:
    """知识图谱引擎"""
    
    def __init__(self):
        self.neo4j_driver = None
        self.milvus_collection = None
        self._init_connections()
        
    def _init_connections(self):
        """初始化数据库连接"""
        try:
            from neo4j import GraphDatabase
            self.neo4j_driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            logger.info("Neo4j连接成功")
        except Exception as e:
            logger.warning(f"Neo4j连接失败: {e}")
            
    async def extract_entities(self, text: str, chapter_number: int = 0) -> List[Entity]:
        """
        从文本中抽取实体
        
        Args:
            text: 待抽取的文本内容
            chapter_number: 章节编号
            
        Returns:
            抽取出的实体列表
        """
        entities = []
        
        # TODO: 使用NLP模型进行实体抽取
        # 1. 使用NER识别角色名、地名、组织名等
        # 2. 使用关系抽取识别实体间关系
        # 3. 使用事件抽取识别关键事件
        
        # 临时：使用规则匹配
        entities.extend(self._extract_characters_by_rules(text, chapter_number))
        entities.extend(self._extract_events_by_rules(text, chapter_number))
        
        return entities
    
    def _extract_characters_by_rules(self, text: str, chapter_number: int) -> List[Character]:
        """基于规则的角色抽取（临时方案）"""
        characters = []
        
        # 中文姓名模式
        name_pattern = r'[\u4e00-\u9fa5]{2,4}'
        
        # 常见称呼词
        titles = ['先生', '女士', '小姐', '公子', '姑娘', '道友', '师兄', '师姐', '师弟', '师妹']
        
        # 抽取逻辑（简化版）
        # 实际应用中应使用训练好的NER模型
        
        return characters
    
    def _extract_events_by_rules(self, text: str, chapter_number: int) -> List[TimelineEvent]:
        """基于规则的事件抽取（临时方案）"""
        events = []
        
        # 事件关键词
        event_keywords = ['杀死', '击败', '获得', '突破', '觉醒', '相遇', '离开', '加入']
        
        # 抽取逻辑（简化版）
        
        return events
    
    async def build_graph(self, work_id: str, entities: List[Entity]) -> None:
        """
        构建知识图谱
        
        Args:
            work_id: 作品ID
            entities: 实体列表
        """
        if not self.neo4j_driver:
            logger.warning("Neo4j未连接，跳过图谱构建")
            return
            
        with self.neo4j_driver.session() as session:
            # 创建作品节点
            session.run(
                "MERGE (w:Work {id: $work_id})",
                work_id=work_id
            )
            
            # 创建实体节点
            for entity in entities:
                session.run(
                    f"""
                    MERGE (e:{entity.entity_type.capitalize()} {{id: $id}})
                    SET e += $attributes
                    MERGE (w:Work {{id: $work_id}})
                    MERGE (w)-[:HAS_ENTITY]->(e)
                    """,
                    id=entity.id,
                    attributes={
                        "name": entity.name,
                        "description": entity.description,
                        "source_chapter": entity.source_chapter,
                        **entity.attributes
                    },
                    work_id=work_id
                )
    
    async def create_relationship(
        self,
        work_id: str,
        from_entity_id: str,
        to_entity_id: str,
        relationship_type: str,
        attributes: Dict[str, Any] = None
    ) -> None:
        """创建实体间关系"""
        if not self.neo4j_driver:
            return
            
        with self.neo4j_driver.session() as session:
            session.run(
                f"""
                MATCH (a {{id: $from_id}}), (b {{id: $to_id}})
                MERGE (a)-[r:{relationship_type}]->(b)
                SET r += $attributes
                """,
                from_id=from_entity_id,
                to_id=to_entity_id,
                attributes=attributes or {}
            )
    
    async def query_subgraph(self, work_id: str, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        """
        查询实体的子图
        
        Args:
            work_id: 作品ID
            entity_id: 起始实体ID
            depth: 查询深度
            
        Returns:
            子图数据
        """
        if not self.neo4j_driver:
            return {}
            
        with self.neo4j_driver.session() as session:
            result = session.run(
                f"""
                MATCH path = (start {{id: $entity_id}})-[*1..{depth}]-(related)
                RETURN path
                """,
                entity_id=entity_id
            )
            
            # 解析路径为图数据
            nodes = []
            relationships = []
            
            for record in result:
                path = record["path"]
                for node in path.nodes:
                    nodes.append(dict(node))
                for rel in path.relationships:
                    relationships.append({
                        "start": rel.start_node.id,
                        "end": rel.end_node.id,
                        "type": rel.type,
                        "properties": dict(rel)
                    })
            
            return {
                "nodes": nodes,
                "relationships": relationships
            }
    
    async def validate_consistency(
        self,
        work_id: str,
        content: str,
        chapter_number: int
    ) -> Dict[str, Any]:
        """
        校验内容一致性
        
        检查生成内容是否与已有知识图谱冲突
        
        Args:
            work_id: 作品ID
            content: 待校验内容
            chapter_number: 章节编号
            
        Returns:
            校验结果
        """
        conflicts = []
        
        # 1. 抽取内容中的实体
        new_entities = await self.extract_entities(content, chapter_number)
        
        # 2. 查询已有图谱
        # 3. 对比检测冲突
        #   - 角色OOC（性格、外貌、能力矛盾）
        #   - 设定矛盾
        #   - 时间线错乱
        
        return {
            "is_valid": len(conflicts) == 0,
            "conflicts": conflicts,
            "new_entities": [e.__dict__ for e in new_entities]
        }
    
    async def get_character_context(self, work_id: str, character_names: List[str]) -> str:
        """
        获取角色上下文信息
        
        用于AI生成时的角色约束
        """
        if not self.neo4j_driver:
            return ""
            
        context_parts = []
        
        with self.neo4j_driver.session() as session:
            for name in character_names:
                result = session.run(
                    """
                    MATCH (c:Character {name: $name})<-[:HAS_ENTITY]-(w:Work {id: $work_id})
                    RETURN c
                    """,
                    name=name,
                    work_id=work_id
                )
                
                record = result.single()
                if record:
                    char = dict(record["c"])
                    context_parts.append(f"""
【角色：{char.get('name', name)}】
- 性别：{char.get('gender', '未知')}
- 性格：{char.get('personality', '未知')}
- 外貌：{char.get('appearance', '未知')}
- 背景：{char.get('background', '未知')}
- 实力：{char.get('power_level', '未知')}
""")
        
        return "\n".join(context_parts)
    
    async def close(self):
        """关闭连接"""
        if self.neo4j_driver:
            self.neo4j_driver.close()


# 单例
_knowledge_graph_engine = None

def get_knowledge_graph_engine() -> KnowledgeGraphEngine:
    """获取知识图谱引擎单例"""
    global _knowledge_graph_engine
    if _knowledge_graph_engine is None:
        _knowledge_graph_engine = KnowledgeGraphEngine()
    return _knowledge_graph_engine
