import React from 'react'
import styles from 'stylesheets/podcasts'

function CategoryList(props) {
  let classNames = [styles.catGrps];

  if (props.className) {
    classNames.push(props.className);
  }

  return (
    <ul className={classNames.join(' ')}>
      {
        props.groups.map((group) => {
          const groupOpen = props.openGroup === group
              , angleClass = groupOpen ? 'fa-angle-up' : 'fa-angle-down'
              ;

          return (
            <li className={styles.catGrp} key={group.id}>
              <div 
                className={styles.catGrpName}
                onClick={
                  () => { 
                    const newOpenGroup = groupOpen ?
                      null :
                      group;
                    props.handleRequestOpenGroup(newOpenGroup);
                  }
                }
              >
                <span>{group.name}</span>
                <i className={`${styles.catGrpAngle} fa ${angleClass} fa-lg`} />
              </div>
              {
                groupOpen &&
                <ul className={styles.cats}>
                  {
                    group.categoryIds.map((id) => {
                      const name = props.categoriesById[id];
                      return (
                        <li 
                          key={id}
                          onClick={() => props.handleCategorySelect(id)}
                        >{name}</li>
                      );
                    })
                  }
                </ul>
              }
            </li>
          );
        })
      }
    </ul>
  );
}

export default CategoryList

