
package com.guan.soapserver.book.domain;

import java.io.Serializable;

/**
 * 类说明
 * 
 * @author ****
 * @date 2017年8月21日 新建
 */
public class Book implements Serializable
{

    private static final long serialVersionUID = -1777264912872946818L;

    private String name;

    public String getName()
    {
        return name;
    }

    public void setName( String name )
    {
        this.name = name;
    }

}
