package com.fzfstudio.eh.innovel.models

/**
 * 图书信息
 */
data class BookModel(
    /** 图书唯一标识 */
    val id: String,
    /** 书名 */
    val title: String,
    /** 作者 */
    val author: String,
    /** 图书类型 */
    val type: String,
    /** 图书内容 */
    val chapters: List<BookChapterModel> = emptyList(),
) {

    /** 总章节数 */
    val totalChapters: Int
        get() = chapters.size

    /** 已阅读章节数 */
    var readChapters: Int = 0;
}

/**
 *  图书 - 章节
 */
data class BookChapterModel(
    /** 所属图书Id */
    val bookId: String,
    /** 章节索引 */
    val index: Int,
    /** 章节标题 */
    val title: String,
    /** 章节内容 */
    val content: String,
) { 
    /** 展示内容 */
    val displayContent: String
        get() = if (content.length > 25) content.take(25) + "..." else content
    /** 是否已经读完 */
    var hadRead: Boolean = false;
}
