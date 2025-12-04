# İçecekler Kategori Hiyerarşisi

```json
{
  "name": "İçecekler",
  "children": [
    {
      "name": "Alkolsüz İçecekler",
      "children": [
        {
          "name": "Gazlı İçecekler",
          "children": [
            {
              "name": "Kola",
              "children": [
                {
                  "name": "Coca-Cola",
                  "children": [
                    {
                      "name": "Coca-Cola Classic",
                      "type": "product"
                    },
                    {
                      "name": "Coca-Cola Zero",
                      "type": "product"
                    }
                  ]
                },
                {
                  "name": "Pepsi",
                  "children": [
                    {
                      "name": "Pepsi Classic",
                      "type": "product"
                    },
                    {
                      "name": "Pepsi Max",
                      "type": "product"
                    }
                  ]
                }
              ]
            },
            {
              "name": "Limonata",
              "children": [
                {
                  "name": "Fanta",
                  "children": [
                    {
                      "name": "Fanta Portakal",
                      "type": "product"
                    },
                    {
                      "name": "Fanta Limon",
                      "type": "product"
                    }
                  ]
                },
                {
                  "name": "Sprite",
                  "children": [
                    {
                      "name": "Sprite Classic",
                      "type": "product"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "name": "Meyve Suları",
          "children": [
            {
              "name": "Portakal Suyu",
              "children": [
                {
                  "name": "Tameki",
                  "children": [
                    {
                      "name": "Tameki Portakal Suyu",
                      "type": "product"
                    }
                  ]
                }
              ]
            },
            {
              "name": "Elma Suyu",
              "children": [
                {
                  "name": "Alpella",
                  "children": [
                    {
                      "name": "Alpella Elma Suyu",
                      "type": "product"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "name": "Enerji İçecekleri",
          "children": [
            {
              "name": "Red Bull",
              "children": [
                {
                  "name": "Red Bull Classic",
                  "type": "product"
                },
                {
                  "name": "Red Bull Sugarfree",
                  "type": "product"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "Alkollü İçecekler",
      "children": [
        {
          "name": "Düşük Alkollü İçecekler (%15 altı)",
          "children": [
            {
              "name": "Bira",
              "children": [
                {
                  "name": "Efes",
                  "children": [
                    {
                      "name": "Efes Pilsen",
                      "type": "product"
                    },
                    {
                      "name": "Efes Dark",
                      "type": "product"
                    }
                  ]
                },
                {
                  "name": "Tuborg",
                  "children": [
                    {
                      "name": "Tuborg Gold",
                      "type": "product"
                    },
                    {
                      "name": "Tuborg Red",
                      "type": "product"
                    }
                  ]
                }
              ]
            },
            {
              "name": "Şarap",
              "children": [
                {
                  "name": "Kırmızı Şarap",
                  "children": [
                    {
                      "name": "Doluca",
                      "children": [
                        {
                          "name": "Doluca Öküzgözü",
                          "type": "product"
                        }
                      ]
                    }
                  ]
                },
                {
                  "name": "Beyaz Şarap",
                  "children": [
                    {
                      "name": "Kavaklıdere",
                      "children": [
                        {
                          "name": "Kavaklıdere Yakut",
                          "type": "product"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "name": "Yüksek Alkollü İçecekler (%15 ve üzeri)",
          "children": [
            {
              "name": "Votka",
              "children": [
                {
                  "name": "Absolut",
                  "children": [
                    {
                      "name": "Absolut Vodka",
                      "type": "product"
                    }
                  ]
                }
              ]
            },
            {
              "name": "Viski",
              "children": [
                {
                  "name": "Johnnie Walker",
                  "children": [
                    {
                      "name": "Johnnie Walker Red Label",
                      "type": "product"
                    },
                    {
                      "name": "Johnnie Walker Black Label",
                      "type": "product"
                    }
                  ]
                }
              ]
            },
            {
              "name": "Raki",
              "children": [
                {
                  "name": "Yeni Raki",
                  "children": [
                    {
                      "name": "Yeni Raki Classic",
                      "type": "product"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Hiyerarşi Açıklaması

Bu kategori hiyerarşisi, içecekleri alkollü ve alkolsüz olarak ayırır. Alkollü içecekler, alkol oranına göre düşük alkollü (%15 altı) ve yüksek alkollü (%15 ve üzeri) olarak sınıflandırılır. Her kategori, marka ve tür bazında alt kategorilere ayrılır. Bu yapı, veri analizi ve raporlama süreçlerini optimize eder.