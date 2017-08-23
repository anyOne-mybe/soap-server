
package com.guan.soapserver.book.action.impl;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Named;

import com.guan.soapserver.book.action.IBookAction;
import com.guan.soapserver.book.domain.Book;

/**
 * 类说明
 * 
 * @author ****
 * @date 2017年8月21日 新建
 */
@Named
public class BookActionImpl implements IBookAction
{

    @Override
    public List<Book> queryBooksByName( String bookName )
    {
        List<Book> books = new ArrayList<>();

        Book book = new Book();
        // book.setName( "Java入门到放弃" );

        books.add( book );

        return books;
    }

}
