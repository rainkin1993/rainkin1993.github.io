---
title: 如何将大规模数据导入Neo4j
categories: technique
---

# 如何将大规模数据导入Neo4j

项目需要基于Neo4j开发，由于数据量较大（数千万节点），因此对当前数据插入的方法进行了分析和对比。

## 常见数据插入方式概览

| Neo4j Version   | Language Driver           |
| --------------- | ------------------------- |
| Community 3.0.2 | Python [neo4j-driver 1.0.0](http://neo4j.com/developer/python/) |

目前主要有以下几种数据插入方式：

1. Cypher CREATE 语句，为每一条数据写一个CREATE
2. Cypher [LOAD CSV](http://neo4j.com/developer/guide-import-csv/#_load_csv_for_medium_sized_datasets) 语句，将数据转成CSV格式，通过LOAD CSV读取数据。
3. 官方提供的Java API —— [Batch Inserter](http://neo4j.com/docs/java-reference/current/javadocs/org/neo4j/unsafe/batchinsert/BatchInserter.html)
4. 大牛编写的 [Batch Import](https://github.com/jexp/batch-import/blob/2.3/readme.md) 工具
5. 官方提供的 [neo4j-import](http://neo4j.com/developer/guide-import-csv/#_super_fast_batch_importer_for_huge_datasets) 工具

这些工具有什么不同呢？速度如何？适用的场景分别是什么？我这里根据我个人理解，粗略地给出了一个结果：




| —————          | CREATE语句    | LOAD CSV语句               | Batch Inserter               | Batch Import                     | Neo4j-import                             |
| --------- | ----------- | ------------------------ | ---------------------------- | -------------------------------- | ---------------------------------------- |
| 适用场景（节点数） | 1 ~ 1w      | 1w ~  10 w               | 千万以上                       | 千万以上                           | 千万以上                                   |
| 速度        | 很慢 (1000 nodes/s)          | 一般 (5000 nodes/s)                      | 非常快 (数万 nodes/s)                         | 非常快 (数万 nodes/s)                             | 非常快 (数万 nodes/s)                                     |
| 优点        | 使用方便，可实时插入。 | 使用方便，可以加载本地/远程CSV；可实时插入。 | 速度相比于前两个，有数量级的提升             | 基于Batch Inserter，可以直接运行编译好的jar包；**可以在已存在的数据库中导入数据** | 官方出品，比Batch Import占用更少的资源                |
| 缺点        | 速度慢         | 需要将数据转换成CSV              | 需要转成CSV；**只能在JAVA中使用**；且插入时**必须停止neo4j** | 需要转成CSV；**必须停止neo4j**                        | 需要转成CSV；**必须停止neo4j**；**只能生成新的数据库，而不能在已存在的数据库中插入数据。** |


## 速度测试

下面是我自己做的一些性能测试：

1. CREATE 语句  （每1000条进行一次Transaction提交）

	```
	CREATE (:label {property1:value, property2:value, property3:value} )
	```
	| 11.5w nodes | 18.5w nodes|
	| :--------: | :--------:|
	| 100 s    |   160 s |


2. LOAD CSV 语句 
	
	```
	using periodic commit 1000
	load csv from "file:///fscapture_screencapture_syscall.csv" as line
	create (:label {a:line[1], b:line[2], c:line[3], d:line[4], e:line[5], f:line[6], g:line[7], h:line[8], i:line[9], j:line[10]})
	```

	这里使用了语句USING PERIODIC COMMIT 1000，使得每1000行作为一次Transaction提交。
	
	| 11.5w nodes | 18.5w nodes|
	| :--------: | :--------:|
	| 21 s    |   39 s |


3. Batch Inserter、Batch Import、Neo4j-import
	我只测试了Neo4j-import，没有测试Batch Inserter和Batch Import，但是我估计他们的内部实现差不多，速度也处于一个数量级别上，因此这里就一概而论了。
	
    neo4j-import需要在Neo4j所在服务器执行，因此服务器的资源影响数据导入的性能，我这里为JVM分配了16G的heap资源，确保性能达到最好。
	
	```
	sudo ./bin/neo4j-import --into graph.db --nodes:label path_to_csv.csv
	```
	
	| 11.5w nodes | 18.5w nodes| 150w nodes + 1431w edges | 3113w nodes + 7793w edges |
	| :--------: | :--------: |  :--------: | :------------:|
	| 3.4 s    |   3.8 s | 26.5 s | 3 m 48 s |



## 结论

1. 如果项目刚开始，想要将大量数据导入数据库，Neo4j-import是最好的选择。
2. 如果数据库已经投入使用，并且可以容忍Neo4j关闭一段时间，那么Batch Import是最好的选择，当然如果你想自己实现，那么你应该选择Batch Inserter
3. 如果数据库已经投入使用，且不能容忍Neo4j的临时关闭，那么LOAD CSV是最好的选择。
4. 最后，如果只是想插入少量的数据，且不怎么在乎实时性，那么请直接看Cypher语言。


## 其它的Tips

1. 在LOAD CSV前面加上USING PERIODIC COMMIT 1000，1000表示每1000行的数据进行一次Transaction提交，提升性能。
2. [建立index](http://jexp.de/blog/2015/04/on-neo4j-indexes-match-merge/)可以使得查询性能得到巨大提升。如果不建立index，则需要对每个node的每一个属性进行遍历，所以比较慢。 并且index建立之后，新加入的数据都会自动编入到index中。 注意index是建立在label上的，不是在node上，所以一个node有多个label，需要对每一个label都建立index。
