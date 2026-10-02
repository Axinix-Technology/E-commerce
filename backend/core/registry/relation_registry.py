from dataclasses import dataclass
from typing import Any, Type
from django.db import models
from django.db.models.fields.related import (
    ForeignKey,
    OneToOneField,
    ManyToManyField,
    ForeignObjectRel,
    ManyToOneRel,
    ManyToManyRel,
    OneToOneRel,
)


@dataclass
class RelationDescriptor:
    name: str
    target_model: Type[models.Model]
    relation_type: str  # "fk", "o2o", "m2m", "reverse_fk", "reverse_o2o", "reverse_m2m"
    is_to_many: bool
    is_nullable: bool
    field: Any


class RelationRegistry:
    """
    Introspects and caches Django ORM relationships for models.
    """
    _cache: dict[Type[models.Model], dict[str, RelationDescriptor]] = {}

    @classmethod
    def introspect(cls, model_class: Type[models.Model]) -> dict[str, RelationDescriptor]:
        if model_class in cls._cache:
            return cls._cache[model_class]

        descriptors: dict[str, RelationDescriptor] = {}

        # 1. Forward fields
        for field in model_class._meta.get_fields():
            name = field.name

            if isinstance(field, OneToOneField):
                descriptors[name] = RelationDescriptor(
                    name=name,
                    target_model=field.related_model,
                    relation_type="o2o",
                    is_to_many=False,
                    is_nullable=field.null,
                    field=field,
                )
            elif isinstance(field, ForeignKey):
                descriptors[name] = RelationDescriptor(
                    name=name,
                    target_model=field.related_model,
                    relation_type="fk",
                    is_to_many=False,
                    is_nullable=field.null,
                    field=field,
                )
            elif isinstance(field, ManyToManyField):
                descriptors[name] = RelationDescriptor(
                    name=name,
                    target_model=field.related_model,
                    relation_type="m2m",
                    is_to_many=True,
                    is_nullable=True,
                    field=field,
                )
            elif isinstance(field, OneToOneRel):
                rel_name = field.get_accessor_name()
                if rel_name:
                    descriptors[rel_name] = RelationDescriptor(
                        name=rel_name,
                        target_model=field.related_model,
                        relation_type="reverse_o2o",
                        is_to_many=False,
                        is_nullable=field.null,
                        field=field,
                    )
            elif isinstance(field, ManyToOneRel):
                rel_name = field.get_accessor_name()
                if rel_name:
                    descriptors[rel_name] = RelationDescriptor(
                        name=rel_name,
                        target_model=field.related_model,
                        relation_type="reverse_fk",
                        is_to_many=True,
                        is_nullable=True,
                        field=field,
                    )
            elif isinstance(field, ManyToManyRel):
                rel_name = field.get_accessor_name()
                if rel_name:
                    descriptors[rel_name] = RelationDescriptor(
                        name=rel_name,
                        target_model=field.related_model,
                        relation_type="reverse_m2m",
                        is_to_many=True,
                        is_nullable=True,
                        field=field,
                    )

        cls._cache[model_class] = descriptors
        return descriptors

    @classmethod
    def get_relation(cls, model_class: Type[models.Model], relation_name: str) -> RelationDescriptor | None:
        relations = cls.introspect(model_class)
        return relations.get(relation_name)

    @classmethod
    def is_relation(cls, model_class: Type[models.Model], relation_name: str) -> bool:
        relations = cls.introspect(model_class)
        return relation_name in relations

    @classmethod
    def get_field_names(cls, model_class: Type[models.Model]) -> set[str]:
        """Returns set of all direct field and relation names on model."""
        return {f.name for f in model_class._meta.get_fields()}
